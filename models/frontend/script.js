const apiUrl = "https://fullstack-task-manager-6raj.onrender.com/tasks";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

async function fetchTasks() {
  try {
    const response = await fetch(apiUrl);
    const tasks = await response.json();

    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";

      li.innerHTML = `
        <span class="task-text ${task.completed ? "completed" : ""}">
          ${task.text}
        </span>
        <div class="task-buttons">
          <button class="toggle-btn" onclick="toggleTask('${task._id}')">
  Toggle
</button>
          <button class="delete-btn" onclick="deleteTask('${task._id}')">
            Delete
          </button>
        </div>
      `;

      taskList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

async function addTask() {
  const text = taskInput.value.trim();

  if (!text) return;

  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    taskInput.value = "";
    fetchTasks();
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

async function toggleTask(id) {
  try {
    await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
    });

    fetchTasks();
  } catch (error) {
    console.error("Error toggling task:", error);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
    });

    fetchTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

addBtn.addEventListener("click", addTask);

fetchTasks();
