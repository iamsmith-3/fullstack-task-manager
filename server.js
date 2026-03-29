require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const Task = require("./models/Task");

const app = express();

app.use(
  cors({
    origin: "https://superb-crisp-190569.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("API is working");
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("GET error:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const newTask = new Task({
      text: req.body.text,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).json({ message: "Error creating task" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({ message: "Error updating task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
