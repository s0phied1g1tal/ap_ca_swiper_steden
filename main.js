import "./style.css";
import Swiper from "swiper";
import "./script.js";

import { Navigation, Pagination } from "swiper/modules";
// import Swiper and modules styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

var swiper = new Swiper(".mySwiper", {
  grabCursor: true,
  effect: "creative",
  creativeEffect: {
    prev: {
      shadow: true,
      translate: [0, 0, -400],
    },
    next: {
      translate: ["100%", 0, 0],
    },
  },
});

function fetchWeather() {
  const loader = document.getElementById("loader");
  const temperature = document.getElementById("temperature");

  // Show loader before fetching weather information
  loader.style.display = "block";

  // Example asynchronous operation (fetching weather info)
  setTimeout(() => {
    // Assume weather information is fetched here

    // Hide loader after fetching weather information
    loader.style.display = "none";

    // Show temperature after loading is complete
    temperature.style.display = "block";
    // Here you can set the temperature value after fetching it
    temperature.innerText = "20°C"; // Just an example value
  }, 2000); // Simulating a delay of 2 seconds for fetching weather info
}

// Call fetchWeather function to initiate fetching weather information
fetchWeather();
