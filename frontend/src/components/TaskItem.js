import React, { useEffect, useState } from "react";
import { deleteTask, updateTask, getTasks } from "../services/api";
import { fetchForecast } from "../utils/api";
import { summariseDays } from "../utils/advisory";

function TaskItem({ task, setTasks, setError }) {
  const [risk, setRisk] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(task);

  useEffect(() => {
    if (!task.weather_sensitive || !task.location || !task.scheduled_date) {
      setRisk(null);
      return;
    }

    fetchForecast(task.location)
      .then((data) => {
        const day = summariseDays(data.list).find((item) => item.date === task.scheduled_date);
        setRisk(day ? day.rating : "unknown");
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

  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      await updateTask(task.id, form);
      setTasks(await getTasks());
      setEditing(false);
    } catch (error) {
      setError(error.message || "Error updating task");
    }
  };

  if (editing) {
    return <form className="task-item" onSubmit={saveEdit}>
      {['title', 'description', 'location', 'scheduled_date'].map((field) => (
        <input key={field} name={field} type={field === 'scheduled_date' ? 'date' : 'text'} value={form[field] || ''}
          onChange={(event) => setForm({ ...form, [field]: event.target.value })} required={field === 'title'} />
      ))}
      <label><input type="checkbox" checked={!!form.weather_sensitive} onChange={(event) => setForm({ ...form, weather_sensitive: event.target.checked })} /> Weather sensitive</label>
      <button type="submit">Save</button><button type="button" onClick={() => setEditing(false)}>Cancel</button>
    </form>;
  }

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
      <button onClick={() => setEditing(true)}>Edit</button>
    </div>
  );
}

export default TaskItem;
