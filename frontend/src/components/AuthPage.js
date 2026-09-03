import React, { useState } from "react";
import { createUser, login } from "../services/api";
import ErrorBanner from "./ErrorBanner";

function AuthPage({ mode, onAuthenticated, onBack, onSwitchMode }) {
  const isSignup = mode === "signup";
  const [forgotPassword, setForgotPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const switchMode = (nextMode) => {
    setError("");
    setForgotPassword(false);
    onSwitchMode(nextMode);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSignup && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
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
      const fallback = isSignup
        ? "We couldn't create your account. Please check your details and try again."
        : "We couldn't sign you in. Check your email and password and try again.";
      setError(requestError.message || fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <button className="back-link" onClick={onBack}>Back to home</button>
      <section className="auth-card">
        <p className="eyebrow">SITEWEATHER</p>
        <h1>{forgotPassword ? "Reset your password" : isSignup ? "Set up your field desk" : "Welcome back"}</h1>
        <p className="auth-intro">{forgotPassword ? "Password resets are handled by your site administrator." : isSignup ? "Create your operator profile to start planning shifts." : "Sign in to see your sites and task schedule."}</p>
        {error && <ErrorBanner message={error} />}
        {forgotPassword ? <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setError("Ask your site administrator to reset this account."); }}>
          <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
          <button className="button button-primary">Request reset</button>
          <button type="button" className="button button-quiet" onClick={() => { setForgotPassword(false); setError(""); }}>Back to login</button>
        </form> : <form onSubmit={submit} className="auth-form">
          {isSignup && <>
            <label>Name<input name="name" value={form.name} onChange={update} required /></label>
            <label>Role<input name="role" value={form.role} onChange={update} placeholder="Foreman" required /></label>
          </>}
          <label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={update} required /></label>
          {isSignup && <label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required /></label>}
          <button className="button button-primary" disabled={loading}>{loading ? "Working..." : isSignup ? "Create account" : "Log in"}</button>
          {!isSignup && <button type="button" className="forgot-link" onClick={() => { setForgotPassword(true); setError(""); }}>Forgot password?</button>}
          {!isSignup && <button type="button" className="forgot-link" onClick={() => switchMode("signup")}>Create an account</button>}
        </form>
        }
      </section>
    </main>
  );
}

export default AuthPage;