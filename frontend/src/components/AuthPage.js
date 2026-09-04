import React, { useState } from "react";
import { createUser, login, requestPasswordReset, resetPassword } from "../services/api";
import ErrorBanner from "./ErrorBanner";

function AuthPage({ mode, onAuthenticated, onBack, onSwitchMode }) {
  const isSignup = mode === "signup";
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const switchMode = (nextMode) => {
    setError("");
    setForgotPassword(false);
    setResetRequested(false);
    setResetComplete(false);
    onSwitchMode(nextMode);
  };

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(form.email);
      setResetRequested(true);
    } catch (requestError) {
      setError(requestError.message || "We couldn't send a reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword({ email: form.email, code: form.code, password: form.password });
      setResetComplete(true);
      setResetRequested(false);
    } catch (requestError) {
      setError(requestError.message || "We couldn't update your password. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <p className="auth-intro">{forgotPassword ? "Request a one-time code by email, then choose a new password." : isSignup ? "Create your operator profile to start planning shifts." : "Sign in to see your sites and task schedule."}</p>
        {error && <ErrorBanner message={error} />}
        {forgotPassword ? <form className="auth-form" onSubmit={resetRequested ? confirmReset : requestReset}>
          <label>Email<input name="email" type="email" value={form.email} onChange={update} required disabled={resetRequested} /></label>
          {resetRequested && <><label>One-time code<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={form.code || ""} onChange={update} required /></label><label>New password<input name="password" type="password" value={form.password} onChange={update} minLength="8" required /></label></>}
          {resetComplete && <p className="success-message">Password updated. You can now log in.</p>}
          {!resetComplete && <button className="button button-primary" disabled={loading}>{loading ? "Working..." : resetRequested ? "Update password" : "Email me a code"}</button>}
          <button type="button" className="button button-quiet" onClick={() => { setForgotPassword(false); setError(""); setResetRequested(false); }}>Back to login</button>
        </form> : <form onSubmit={submit} className="auth-form">
          {isSignup && <>
            <label>Name<input name="name" value={form.name} onChange={update} required /></label>
            <label>Role
              <select name="role" value={form.role} onChange={update} required>
                <option value="">Select your role</option>
                <option value="Site manager">Site manager</option>
                <option value="Project manager">Project manager</option>
                <option value="Construction engineer">Construction engineer</option>
                <option value="Safety officer">Safety officer</option>
                <option value="Client / developer">Client / developer</option>
                <option value="Other">Other</option>
              </select>
            </label>
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