import React from "react";
import { deleteTask, updateTask, getTasks } from "../services/api";

function TaskItem({ task, setTasks, setError }) {
  const toggleStatus = async () => {
    try {
      await updateTask(task.id, { status: task.status === "pending" ? "done" : "pending" });
      setTasks(await getTasks());
    } catch {
      setError("Error updating task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      setTasks(await getTasks());
    } catch {
      setError("Error deleting task");
    }
  };

  return (
    <div className="task-item">
      <strong>{task.title}</strong> — {task.status}
      <br />
      Assigned to: {task.user_name || "Unassigned"}
      <button onClick={toggleStatus}>
        Mark {task.status === "pending" ? "Done" : "Pending"}
      </button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

export default TaskItem;
