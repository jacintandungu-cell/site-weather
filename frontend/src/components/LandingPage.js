import React from "react";

function LandingPage({ onLogin, onSignup }) {
  return (
    <main className="landing-page">
      <section className="landing-hero">
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
      </section>

      <section className="landing-story" aria-labelledby="about-heading">
        <div className="story-intro">
          <p className="eyebrow">WHY SITEWEATHER</p>
          <h2 id="about-heading">Good work starts with a better read of the day.</h2>
        </div>
        <div className="story-grid">
          <article>
            <span className="story-number">01</span>
            <h3>The problem</h3>
            <p>Weather delays, unsafe conditions, and rework often arrive after a crew has already committed time and materials to site.</p>
          </article>
          <article>
            <span className="story-number">02</span>
            <h3>The solution</h3>
            <p>SiteWeather turns live conditions and the five-day forecast into practical trade guidance, workable windows, and an organised task plan.</p>
          </article>
        </div>
        <div className="landing-cta">
          <div>
            <p className="eyebrow">READY FOR THE NEXT SHIFT?</p>
            <h2>Create your field desk today.</h2>
          </div>
          <button className="button button-primary" onClick={onSignup}>Create an account</button>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;