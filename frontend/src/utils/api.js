const API_KEY =
  process.env.REACT_APP_WEATHER_API_KEY || "3218121adef5ab8d8a1295284c166160";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

function loadWeather(endpoint, city) {
  const url =
    BASE_URL +
    "/" +
    endpoint +
    "?q=" +
    encodeURIComponent(city) +
    "&appid=" +
    API_KEY +
    "&units=metric";

  return fetch(url).then(function (response) {
    if (response.status === 404) {
      throw new Error(
        'We could not find "' +
          city +
          '". Try the nearest town, or add the country code, e.g. "Nakuru,KE".'
      );
    }

    if (!response.ok) {
      throw new Error("The weather service is not responding. Please try again.");
    }

    return response.json();
  });
}

export function fetchCurrent(city) {
  return loadWeather("weather", city);
}

export function fetchForecast(city) {
  return loadWeather("forecast", city);
}
