import React, { useState } from "react";
import { createUser, getUsers } from "../services/api";

function UserForm({ setUsers, setError }) {
  const [formData, setFormData] = useState({ name: "", email: "", role: "", password: "" });

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

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="role" placeholder="Role" value={formData.role} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
      <button type="submit">Add User</button>
    </form>
  );
}

export default UserForm;
