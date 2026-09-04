import React from "react";

function LandingPage({ onLogin, onSignup, darkMode, onToggleTheme }) {
  return (
    <main className="landing-page">
      <div className="landing-toolbar">
        <button type="button" className="theme-toggle landing-theme-toggle" onClick={onToggleTheme}>
          {darkMode ? "Light mode" : "Dark mode"}
        </button>
      </div>
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

      <section className="landing-faq" aria-labelledby="faq-heading">
        <div className="story-intro">
          <p className="eyebrow">QUICK ANSWERS</p>
          <h2 id="faq-heading">Questions from the site office.</h2>
        </div>
        <div className="faq-list">
          <details>
            <summary>Who is SiteWeather for?</summary>
            <p>It is built for site managers, project managers, engineers, safety officers, clients, and anyone coordinating weather-sensitive work.</p>
          </details>
          <details>
            <summary>What does the weather assessment show?</summary>
            <p>It combines current conditions with a five-day forecast to give trade-by-trade guidance, workable windows, and actions for the shift.</p>
          </details>
          <details>
            <summary>Can I manage tasks as well as check weather?</summary>
            <p>Yes. Your field desk lets you create, assign, update, and remove construction tasks, including weather-sensitive work.</p>
          </details>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;