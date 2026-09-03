import React from "react";

function LandingPage({ onLogin, onSignup }) {
  return (
    <main className="landing-page">
      <div className="landing-copy">
        <p className="eyebrow">SITEWEATHER / FIELD OPERATIONS</p>
        <h1>Make the weather part of the plan.</h1>
        <p className="landing-lede">
          A clear morning view of site conditions, workable hours, and the tasks that need
          attention before the crew arrives.
        </p>
        <div className="landing-actions">
          <button className="button button-primary" onClick={onLogin}>Log in</button>
          <button className="button button-quiet" onClick={onSignup}>Create an account</button>
        </div>
      </div>
      <div className="landing-signal" aria-hidden="true">
        <span className="signal-label">TODAY'S SITE SIGNAL</span>
        <strong>WORK WITH<br />CONTROL</strong>
        <span className="signal-line" />
        <small>Forecast-led decisions for every shift.</small>
      </div>
    </main>
  );
}

export default LandingPage;