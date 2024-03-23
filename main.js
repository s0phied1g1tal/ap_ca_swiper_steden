import "./style.css";
import Swiper from "swiper";
import "./script.js";

import { Navigation, Pagination } from "swiper/modules";
// import Swiper and modules styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
  // Create scene
  var scene = new THREE.Scene();

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
  labelContext.font = 'Bold 24px Arial';
  labelContext.fillStyle = 'rgba(0, 0, 0, 1)';
  labelContext.textAlign = 'center';
  
  var pins = []; // Array to store pin meshes
  var labels = [];

  for (var city in cities) {
    var latitude = cities[city].lat * (Math.PI / 180);
    var longitude = -cities[city].lon * (Math.PI / 180);

    var pinX = Math.cos(latitude) * Math.cos(longitude) * 2;
    var pinY = Math.sin(latitude) * 2;
    var pinZ = Math.cos(latitude) * Math.sin(longitude) * 2;

    var pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.position.set(pinX, pinY, pinZ);
    scene.add(pin);
    pins.push(pin);

    // Add city label
    var labelTexture = new THREE.Texture(labelCanvas);
    labelTexture.needsUpdate = true;

    var labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide, transparent: true });

    var labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.5),
      labelMaterial
    );

    labelMesh.position.set(pinX, pinY + 0.1, pinZ);
    scene.add(labelMesh);

    labels.push({ mesh: labelMesh, text: city });
  }

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

  // Render the scene
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    
    // Update labels' textures
    labels.forEach(function(label) {
      labelContext.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      var metrics = labelContext.measureText(label.text);
      var width = metrics.width + 10;
      labelCanvas.width = width;
      labelContext.fillStyle = '#ffffff';
      labelContext.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
      labelContext.fillStyle = '#000000';
      labelContext.fillText(label.text, width / 2, 20);
      label.mesh.material.map.needsUpdate = true;
    });
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
