require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const Task = require("./models/Task");
const User = require("./models/User");
const auth = require("./middleware/auth");

const app = express();

app.use(
  cors({
    origin: "https://superb-crisp-190569.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("API is working");
});

// SIGN UP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" },
    );

    res.json({ token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" },
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login error" });
  }
});

// GET TASKS
app.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("GET tasks error:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// ADD TASK
app.post("/tasks", auth, async (req, res) => {
  try {
    const newTask = new Task({
      text: req.body.text,
      user: req.user.id,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("POST task error:", error);
    res.status(500).json({ message: "Error creating task" });
  }
});

// TOGGLE TASK
app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("PUT task error:", error);
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE TASK
app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("DELETE task error:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
