import { apiKey } from "./key";

async function fetchWeather(cityName, elementToUpdate) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const temperature = data.main.temp;
    elementToUpdate.textContent = `${temperature}°C`; // Update temperature display
  } catch (error) {
    console.log(`Error fetching weather data for ${cityName}: ${error}`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const cities = [
    "Antwerpen",
    "Buenos Aires",
    "Johannesburg",
    "New York",
    "Tokyo",
  ];
  const temperatureElements = document.querySelectorAll(".temperature");

  cities.forEach(async (cityName, index) => {
    const elementToUpdate = temperatureElements[index];
    await fetchWeather(cityName, elementToUpdate);
  });
});
