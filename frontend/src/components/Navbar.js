import React, { useState } from "react";

const TABS = [
  {
    id: "forecast",
    label: "5-day plan",
    body: "Each of the next five days scored for workable hours, so you can book pours, major lifts and roofing into the best window and move indoor works into the wet ones.",
  },
  {
    id: "about",
    label: "About",
    body: "Weather delays and rework are avoidable when the forecast is read against real site limits. This dashboard applies those limits for you and tells you what to do, not just what the weather is.",
  },
  {
    id: "weather",
    label: "Site conditions",
    body: "A go / caution / stop call for every trade on site - concrete, roofing, lifting, painting, earthworks, scaffolding, masonry and general labour - with the control measures to put in place before the shift starts.",
  },
];

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function Navbar({ currentUser, onLogout, onSettings, darkMode, onToggleTheme }) {
  const [active, setActive] = useState("weather");
  const panel = TABS.find((tab) => tab.id === active);

  return (
    <header className="navbar">
      <aside className="sidebar-nav">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">🏗</span>
          <div>
            <h1>Site Weather</h1>
            <p>Weather turned into site decisions</p>
          </div>
        </div>

        <nav aria-label="Dashboard navigation">
          <span className="sidebar-label">WORKSPACE</span>
          <ul>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  className={active === tab.id ? "tab tab-active" : "tab"}
                  onClick={() => setActive(tab.id)}
                >
                  <span className="tab-index">0{TABS.indexOf(tab) + 1}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          {currentUser && <div className="user-identity"><span className="user-avatar" aria-hidden="true">{initials(currentUser.name)}</span><span className="signed-in">{currentUser.name}</span></div>}
          {onToggleTheme && <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <span className="theme-icon" aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>}
          <div className="sidebar-actions">
            {onSettings && <button className="sidebar-action" type="button" onClick={onSettings}>Profile settings</button>}
            {onLogout && <button className="sidebar-action sidebar-logout" type="button" onClick={onLogout}>Log out</button>}
          </div>
        </div>
      </aside>
      <div className="navbar-main">
        <p className="navbar-panel">{panel.body}</p>
      </div>
    </header>
  );
}

export default Navbar;
