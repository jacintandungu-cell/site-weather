import React, { useState, useEffect } from "react";
import { fetchForecast } from "../utils/api";
import { summariseDays, planningTip, STATUS } from "../utils/advisory";
import ErrorBanner from "./ErrorBanner";

function windowText(day) {
  if (day.workableHours === null) {
    return "Shift over - plan from tomorrow";
  }
  return day.score + "% workable · " + day.workableHours + "h window";
}

function Forecast({ city }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetchForecast(city)
      .then((data) => {
        setDays(summariseDays(data.list));
        setLoading(false);
      })
      .catch((err) => {
        setDays([]);
        setError(err.message || "Unable to load the forecast");
        setLoading(false);
      });
  }, [city]);

  if (loading) {
    return (
      <section className="panel loading">
        <span className="spinner" />
        <p>Building the 5-day work plan...</p>
      </section>
    );
  }

  if (days.length === 0) {
    return error ? <ErrorBanner message={error} /> : null;
  }

  const tip = planningTip(days);

  return (
    <section className="panel" id="forecast">
      <header className="panel-head">
        <div>
          <p className="eyebrow">5-day plan</p>
          <h2>Programme outlook</h2>
        </div>
      </header>

      {tip && <div className="tip">📋 {tip}</div>}

      <div className="forecast-grid">
        {days.map((day) => (
          <article key={day.date} className={"day day-" + day.rating}>
            <header>
              <strong>{day.label}</strong>
              <span>{day.dateText}</span>
            </header>

            <p className="day-temp">
              {Math.round(day.maxTemp)}° <span>/ {Math.round(day.minTemp)}°</span>
            </p>

            <div className="meter">
              <span
                className={"meter-fill fill-" + day.rating}
                style={{ width: day.score + "%" }}
              />
            </div>
            <p className="day-score">{windowText(day)}</p>

            <ul className="day-stats">
              <li>💧 {Math.round(day.rainChance * 100)}% rain</li>
              <li>💨 {Math.round(day.maxWind * 3.6)} km/h</li>
            </ul>

            <p className="day-guidance">{day.guidance}</p>
            <span className={"pill pill-" + day.rating}>{STATUS[day.rating].badge}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Forecast;
