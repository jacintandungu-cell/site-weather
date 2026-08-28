import React, { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../services/api";
import ErrorBanner from "./ErrorBanner";

function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "" });

  useEffect(() => {
    getUsers().then(setUsers).catch(() => setError("Error loading users"));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setUsers(await getUsers());
      setFormData({ name: "", email: "", role: "", password: "" });
    } catch {
      setError("Error creating user");
    }
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    setUsers(await getUsers());
  };

  return (
    <div className="user-list">
      <h2>Users</h2>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input name="role" value={formData.role} onChange={handleChange} placeholder="Role" required />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
        <button type="submit">Add User</button>
      </form>
      {users.length === 0 ? (
        <p>No users yet.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.name} ({u.role}) — {u.email}
              <button onClick={() => handleDelete(u.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
