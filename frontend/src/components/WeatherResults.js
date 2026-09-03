import React, { useState, useEffect } from "react";
import { fetchCurrent } from "../utils/api";
import { assessSite, STATUS } from "../utils/advisory";

function WeatherResults({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetchCurrent(city)
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [city]);

  if (loading) {
    return (
      <section className="panel loading">
        <span className="spinner" />
        <p>Assessing site conditions...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel error-card">
        <h3>Site not found</h3>
        <p>{error}</p>
      </section>
    );
  }

  const advice = assessSite(weather);

  return (
    <section className="panel" id="weather">
      <header className="panel-head">
        <div>
          <p className="eyebrow">Site conditions</p>
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
        </div>
        <span className={"badge badge-" + advice.siteStatus}>
          {STATUS[advice.siteStatus].badge}
        </span>
      </header>

      <div className="reading">
        <div className="reading-temp">
          <strong>{Math.round(advice.conditions.temp)}°C</strong>
          <span>feels like {Math.round(advice.conditions.feelsLike)}°C</span>
        </div>

        <ul className="metrics">
          <li>
            <span>Conditions</span>
            <strong className="capitalise">{advice.conditions.description}</strong>
          </li>
          <li>
            <span>Wind</span>
            <strong>{Math.round(advice.conditions.wind * 3.6)} km/h</strong>
          </li>
          <li>
            <span>Humidity</span>
            <strong>{advice.conditions.humidity}%</strong>
          </li>
        </ul>
      </div>

      <div className={"verdict verdict-" + advice.siteStatus}>
        <strong>{STATUS[advice.siteStatus].label}.</strong> {advice.headline}
      </div>

      <h3 className="section-title">Trade-by-trade call</h3>
      <div className="activity-grid">
        {advice.trades.map((trade) => (
          <article key={trade.name} className={"activity activity-" + trade.status}>
            <header>
              <span className="activity-icon">{trade.icon}</span>
              <h4>{trade.name}</h4>
              <span className={"pill pill-" + trade.status}>
                {STATUS[trade.status].badge}
              </span>
            </header>
            <p>{trade.note}</p>
          </article>
        ))}
      </div>

      {advice.actions.length > 0 && (
        <div className="actions">
          <h3 className="section-title">Actions for today's shift</h3>
          <ol>
            {advice.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

export default WeatherResults;
