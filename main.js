import "./style.css";
import Swiper from "swiper";
import "./script.js";

import { Navigation, Pagination } from "swiper/modules";
// import Swiper and modules styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import * as THREE from 'three';

// Create scene
var scene = new THREE.Scene();
// Load the galaxy texture
var galaxyTexture = new THREE.TextureLoader().load('images/galaxy.jpg');


// Set background texture to galaxy texture
scene.background = galaxyTexture;

// Create camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create globe
var geometry = new THREE.SphereGeometry(2, 32, 32);
var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg');
var material = new THREE.MeshBasicMaterial({ map: texture });
var globe = new THREE.Mesh(geometry, material);
scene.add(globe);

// Create pins
var cities = {
  "New York": { lat: 40.7128, lon: -74.0060 },
  "Buenos Aires": { lat: -34.6037, lon: -58.3816 },
  "Antwerp": { lat: 51.2194, lon: 4.4025 },
  "Johannesburg": { lat: -26.2041, lon: 28.0473 },
  "Tokyo": { lat: 35.6895, lon: 139.6917 }
};

var pinGeometry = new THREE.SphereGeometry(0.05, 32, 32);
var pinMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

var labelCanvas = document.createElement('canvas');
var labelContext = labelCanvas.getContext('2d');
labelCanvas.width = 256;
labelCanvas.height = 128;
labelContext.font = 'Bold 24px Arial';
labelContext.fillStyle = 'rgba(0, 0, 0, 1)';
labelContext.textAlign = 'center';

var pins = []; // Array to store pin meshes
var labels = [];

// Function to create texture for city label with temperature
function createLabelTexture(text) {
  var labelCanvas = document.createElement('canvas'); // Create a new canvas for each label
  var labelContext = labelCanvas.getContext('2d');
  labelCanvas.width = 256;
  labelCanvas.height = 128;
  labelContext.fillStyle = 'red'; // Set text color to red
  labelContext.font = 'Bold 28px Arial'; // Set font size and weight
  labelContext.textAlign = 'center';
  labelContext.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);
  var texture = new THREE.Texture(labelCanvas);
  texture.needsUpdate = true;
  return texture;
}

// Function to fetch temperature for a city
async function fetchTemperature(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=81d788c17053e9ba3f53c9693a3fb263&units=metric`);
    const data = await response.json();
    return data.main.temp.toFixed(1) + '°C';
  } catch (error) {
    return 'N/A';
  }
}

// Create pins and labels for each city
async function createPinsAndLabels() {
  for (let city in cities) {
    (async (city) => { // Immediately Invoked Function Expression (IIFE) to capture city value
      var latitude = cities[city].lat * (Math.PI / 180);
      var longitude = -cities[city].lon * (Math.PI / 180);

      var pinX = Math.cos(latitude) * Math.cos(longitude) * 2;
      var pinY = Math.sin(latitude) * 2;
      var pinZ = Math.cos(latitude) * Math.sin(longitude) * 2;

      var pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(pinX, pinY, pinZ);
      scene.add(pin);
      pins.push(pin);

      // Fetch temperature for the city
      var temperature = await fetchTemperature(city);
      var labelText = city + '\n' + temperature;
      var labelTexture = createLabelTexture(labelText);

      var labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide, transparent: true });

      var labelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 0.5),
        labelMaterial
      );

      // Add a small offset to y-position to elevate the label from the pin
      labelMesh.position.set(pinX, pinY + 0.25, pinZ);
      scene.add(labelMesh);

      labels.push({ mesh: labelMesh, text: labelText });
    })(city); // Pass current city value to the IIFE
  }
}

createPinsAndLabels();

// Add event listeners for mouse interaction
var mouseDown = false;
var mouseX = 0;
var mouseY = 0;

window.addEventListener('mousedown', function(event) {
  mouseDown = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener('mouseup', function() {
  mouseDown = false;
});

window.addEventListener('mousemove', function(event) {
  if (mouseDown) {
    var deltaX = event.clientX - mouseX;
    var deltaY = event.clientY - mouseY;

    mouseX = event.clientX;
    mouseY = event.clientY;

    var deltaRotationQuaternion = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(
        deltaY * 0.01,
        deltaX * 0.01,
        0,
        'XYZ'
      ));

    globe.quaternion.multiplyQuaternions(deltaRotationQuaternion, globe.quaternion);

    // Update pin positions based on globe rotation
    for (var i = 0; i < pins.length; i++) {
      pins[i].position.applyQuaternion(deltaRotationQuaternion);
      labels[i].mesh.position.applyQuaternion(deltaRotationQuaternion);
    }
  }
});

// Add event listener to resize renderer
window.addEventListener('resize', function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

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
  const temperatureContainer = document.getElementById("temperature");

  // Show loader before fetching weather information
  loader.style.display = "block";

  // Example asynchronous operation (fetching weather info)
  setTimeout(async () => {
    try {
      // Fetch weather information for each city
      for (let city in cities) {
        const temperature = await fetchTemperature(city);
        const temperatureElement = document.createElement("div");
        temperatureElement.innerText = `${city}: ${temperature}`;
        temperatureContainer.appendChild(temperatureElement);
      }
    } catch (error) {
      console.error("Error")
      console.error("Error fetching weather:", error);
    } finally {
      // Hide loader after fetching weather information
      loader.style.display = "none";
    }
  }, 2000); // Simulating a delay of 2 seconds for fetching weather info
}

// Call fetchWeather function to initiate fetching weather information
fetchWeather();
