import React from "react";
import Forecast from "./Forecast";

function ForecastPanel({ city }) {
  return city ? <Forecast city={city} /> : null;
}

export default ForecastPanel;