import React, { useState, useEffect } from "react";
import { createTask, getTasks, getUsers } from "../services/api";

function TaskForm({ setTasks, setError }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    scheduled_date: "",
    weather_sensitive: false,
    user_id: ""
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((error) => setError(error.message || "Error loading users"))
      .finally(() => setLoadingUsers(false));
  }, [setError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      setTasks(await getTasks());
      setFormData({
        title: "",
        description: "",
        location: "",
        scheduled_date: "",
        weather_sensitive: false,
        user_id: ""
      });
    } catch {
      setError("Error creating task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input name="title" placeholder="Task title" value={formData.title} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
      <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
      <input type="date" name="scheduled_date" value={formData.scheduled_date} onChange={handleChange} />
      <label>
        Weather Sensitive?
        <input type="checkbox" name="weather_sensitive" checked={formData.weather_sensitive} onChange={handleChange} />
      </label>
      <select name="user_id" value={formData.user_id} onChange={handleChange} required disabled={loadingUsers}>
        <option value="">{loadingUsers ? "Loading users..." : "Assign to user"}</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskForm;
