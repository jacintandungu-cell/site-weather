import React, { useState } from "react";

const TABS = [
  {
    id: "weather",
    label: "Site conditions",
    body: "A go / caution / stop call for every trade on site - concrete, roofing, lifting, painting, earthworks, scaffolding, masonry and general labour - with the control measures to put in place before the shift starts.",
  },
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
];

function Navbar() {
  const [active, setActive] = useState("weather");
  const panel = TABS.find((tab) => tab.id === active);

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            🏗
          </span>
          <div>
            <h1>Construction Weather Dashboard</h1>
            <p>Weather turned into site decisions</p>
          </div>
        </div>

        <nav>
          <ul>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  className={active === tab.id ? "tab tab-active" : "tab"}
                  onClick={() => setActive(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="navbar-panel">{panel.body}</p>
    </header>
  );
}

export default Navbar;
