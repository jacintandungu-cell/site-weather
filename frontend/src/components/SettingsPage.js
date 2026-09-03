import React, { useState } from "react";
import { updateUser } from "../services/api";
import ErrorBanner from "./ErrorBanner";

function SettingsPage({ user, onUpdated, onClose }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      const updated = await updateUser(user.id, form);
      onUpdated({ ...user, ...updated });
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="settings-page">
      <section className="settings-card">
        <button className="back-link" onClick={onClose}>Back to dashboard</button>
        <p className="eyebrow">ACCOUNT SETTINGS</p>
        <h1>Update your field profile</h1>
        <p className="auth-intro">Keep the contact details shown across your SiteWeather workspace current.</p>
        {error && <ErrorBanner message={error} />}
        {saved && <p className="success-message">Profile updated successfully.</p>}
        <form onSubmit={submit} className="auth-form">
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Role<input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required /></label>
          <button className="button button-primary">Save changes</button>
        </form>
      </section>
    </main>
  );
}

export default SettingsPage;
