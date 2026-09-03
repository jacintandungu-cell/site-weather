import React, { useState } from "react";
import { createUser, login } from "../services/api";
import ErrorBanner from "./ErrorBanner";

function AuthPage({ mode, onAuthenticated, onBack }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", role: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignup) {
        const created = await createUser(form);
        localStorage.setItem("siteweather_token", created.access_token);
        onAuthenticated({ id: created.id, name: form.name, email: form.email, role: form.role });
      } else {
        const authenticated = await login({ email: form.email, password: form.password });
        localStorage.setItem("siteweather_token", authenticated.access_token);
        onAuthenticated(authenticated);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <button className="back-link" onClick={onBack}>Back to home</button>
      <section className="auth-card">
        <p className="eyebrow">SITEWEATHER</p>
        <h1>{isSignup ? "Set up your field desk" : "Welcome back"}</h1>
        <p className="auth-intro">{isSignup ? "Create your operator profile to start planning shifts." : "Sign in to see your sites and task schedule."}</p>
        {error && <ErrorBanner message={error} />}
        <form onSubmit={submit} className="auth-form">
          {isSignup && <>
            <label>Name<input name="name" value={form.name} onChange={update} required /></label>
            <label>Role<input name="role" value={form.role} onChange={update} placeholder="Foreman" required /></label>
          </>}
          <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={update} required /></label>
          <button className="button button-primary" disabled={loading}>{loading ? "Working..." : isSignup ? "Create account" : "Log in"}</button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;