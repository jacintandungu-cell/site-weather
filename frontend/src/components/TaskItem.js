import React, { useEffect, useState } from "react";
import { deleteTask, updateTask, getTasks } from "../services/api";
import { fetchForecast } from "../utils/api";
import { summariseDays } from "../utils/advisory";

function TaskItem({ task, setTasks, setError }) {
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    if (!task.weather_sensitive || !task.location || !task.scheduled_date) {
      setRisk(null);
      return;
    }

    fetchForecast(task.location)
      .then((data) => {
        const day = summariseDays(data.list).find((item) => item.date === task.scheduled_date);
        setRisk(day && day.rating !== "go" ? day.rating : "go");
      })
      .catch(() => setRisk("unknown"));
  }, [task.weather_sensitive, task.location, task.scheduled_date]);

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
      {task.weather_sensitive && (
        <span className={"risk-badge risk-" + (risk || "loading")}>
          {risk === "unknown" ? "Weather unavailable" : risk ? risk + " weather risk" : "Checking weather..."}
        </span>
      )}
      <button onClick={toggleStatus}>
        Mark {task.status === "pending" ? "Done" : "Pending"}
      </button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

export default TaskItem;
