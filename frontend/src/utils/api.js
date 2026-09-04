import { getWeather } from "../services/api";

function loadWeather(endpoint, city) {
  return getWeather(endpoint, city).catch(function (error) {
    if (error.message === "Site location not found") {
      throw new Error('We could not find "' + city + '". Try the nearest town, or add the country code, e.g. "Nakuru,KE".');
    }
    throw error;
  });
}

export function fetchCurrent(city) {
  return loadWeather("weather", city);
}

export function fetchForecast(city) {
  return loadWeather("forecast", city);
}
