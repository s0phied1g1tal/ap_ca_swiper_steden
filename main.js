import "./style.css";
import Swiper from "swiper";
import "./script.js";

import { Navigation, Pagination } from "swiper/modules";
// import Swiper and modules styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/CSS2DRenderer.js';

let markerInfo = []; // Define markerInfo array here
let markers; // Define markers variable here

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 2000);
camera.position.set(0.5, 0.5, 1).setLength(14);
let renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0xaaffaa);
document.body.appendChild(renderer.domElement);

let labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

window.addEventListener("resize", onWindowResize);

let controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 15;
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed *= 0.25;

let globalUniforms = {
  time: { value: 0 }
};

// <GLOBE>
let counter = 200000;
let rad = 5;
let sph = new THREE.Spherical();

let r = 0;
let dlong = Math.PI * (3 - Math.sqrt(5));
let dz = 2 / counter;
let long = 0;
let z = 1 - dz / 2;

let pts = [];
let clr = [];
let c = new THREE.Color();
let uvs = [];

for (let i = 0; i < counter; i++) {
  r = Math.sqrt(1 - z * z);
  let p = new THREE.Vector3(
    Math.cos(long) * r,
    z,
    -Math.sin(long) * r
  ).multiplyScalar(rad);
  pts.push(p);
  z = z - dz;
  long = long + dlong;

  c.setHSL(0.45, 0.5, Math.random() * 0.25 + 0.25);
  c.toArray(clr, i * 3);

  sph.setFromVector3(p);
  uvs.push((sph.theta + Math.PI) / (Math.PI * 2), 1.0 - sph.phi / Math.PI);
}

let g = new THREE.BufferGeometry().setFromPoints(pts);
g.setAttribute("color", new THREE.Float32BufferAttribute(clr, 3));
g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
let m = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  onBeforeCompile: (shader) => {
    shader.uniforms.globeTexture = {
      value: new THREE.TextureLoader().load(imgData)
    };
    shader.vertexShader = `
      uniform sampler2D globeTexture;
      varying float vVisibility;
      varying vec3 vNormal;
      varying vec3 vMvPosition;
      ${shader.vertexShader}
    `.replace(
      `gl_PointSize = size;`,
      `
        vVisibility = texture(globeTexture, uv).g; // get value from texture
        gl_PointSize = size * (vVisibility < 0.5 ? 1. : 0.75); // size depends on the value
        vNormal = normalMatrix * normalize(position);
        vMvPosition = -mvPosition.xyz;
        gl_PointSize *= 0.4 + (dot(normalize(vMvPosition), vNormal) * 0.6); // size depends position in camera space
      `
    );
    shader.fragmentShader = `
      varying float vVisibility;
      varying vec3 vNormal;
      varying vec3 vMvPosition;
      ${shader.fragmentShader}
    `.replace(
      `vec4 diffuseColor = vec4( diffuse, opacity );`,
      `
        bool circ = length(gl_PointCoord - 0.5) > 0.5; // make points round
        bool vis = dot(vMvPosition, vNormal) < 0.; // visible only on the front side of the sphere
        if (circ || vis) discard;
        
        vec3 col = diffuse + (vVisibility > 0.5 ? 0.5 : 0.); // make oceans brighter
        
        vec4 diffuseColor = vec4( col, opacity );
      `
    );
  }
});
let globe = new THREE.Points(g, m);
scene.add(globe);

let icshdrn = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 1), new THREE.MeshBasicMaterial({ color: 0x647f7f, wireframe: true }));
globe.add(icshdrn);

// Add markers for specific locations
const locations = [
  { name: "New York", latitude: 43.0000, longitude: -75.0000 },
  { name: "Johannesburg", latitude:  -26.195246, longitude:  28.034088 },
  { name: "Buenos Aires", latitude: -34.603722, longitude: -58.381592 },
  { name: "Tokyo", latitude: 35.6895, longitude: 139.6917 },
  { name: "Antwerp", latitude: 51.260197, longitude: 4.402771 }
];

// Add markers for specific locations

// Add markers for specific locations
for (let location of locations) {
  let marker = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000 }));

  // Convert latitude and longitude to radians
  let latRad = THREE.MathUtils.degToRad(location.latitude);
  let lonRad = THREE.MathUtils.degToRad(location.longitude);

  // Convert spherical coordinates to Cartesian coordinates
  let phi = Math.PI / 2 - latRad;
  let theta = lonRad;

  let x = rad * Math.sin(phi) * Math.cos(theta);
  let y = rad * Math.cos(phi);
  let z = rad * Math.sin(phi) * Math.sin(theta);

  marker.position.set(x, y, z);
  globe.add(marker);

  // Store marker information if needed
  markerInfo.push({
    name: location.name,
    position: marker.position
  });
}


// Mouse click event listener
window.addEventListener('click', function(event) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Perform raycasting
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(globe.children);

  if (intersects.length > 0) {
    // Get the name of the city associated with the clicked marker
    let cityName = intersects[0].object.userData.city;
    alert('Clicked on ' + cityName); // Display city name when clicked
  }
});


  // </GLOBE>
  
  // <Interaction>
  let pointer = new THREE.Vector2();
  let raycaster = new THREE.Raycaster();
  let intersections;
  let labelDiv = document.getElementById("markerLabel");
  let closeBtn = document.getElementById("closeButton");
  let divID = document.getElementById("idNum");
  let divMag = document.getElementById("magnitude");
  let divCrd = document.getElementById("coordinates");
  
  closeBtn.addEventListener("pointerdown", event => {
    labelDiv.classList.add("hidden");
  });
  
  let label = new CSS2DObject(labelDiv);
  label.userData = {
    cNormal: new THREE.Vector3(),
    cPosition: new THREE.Vector3(),
    mat4: new THREE.Matrix4(),
    trackVisibility: () => { // the closer to the edge, the less opacity
      let ud = label.userData;
      ud.cNormal.copy(label.position).normalize().applyMatrix3(globe.normalMatrix);
      ud.cPosition.copy(label.position).applyMatrix4(ud.mat4.multiplyMatrices(camera.matrixWorldInverse, globe.matrixWorld));
      let d = ud.cPosition.negate().normalize().dot(ud.cNormal);
      d = smoothstep(0.2, 0.7, d);
      label.element.style.opacity = d;
      
      // https://github.com/gre/smoothstep/blob/master/index.js
      function smoothstep (min, max, value) {
        var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
        return x*x*(3 - 2*x);
      };
    }
  }
  scene.add(label);
  
  window.addEventListener("pointerdown", event => {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    intersections = raycaster.intersectObject(globe);
  
    if (intersections.length > 0) {
      let intersection = intersections[0];
      let point = intersection.point;
  
      let closestMarker = null;
      let closestDistance = Infinity;
  
      for (let marker of markers.children) {
        let distance = marker.position.distanceTo(point);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestMarker = marker;
        }
      }
  
      if (closestMarker) {
        let markerIndex = markers.children.indexOf(closestMarker);
        let mi = markerInfo[markerIndex];
        divID.innerHTML = `ID: <b>${mi.id}</b>`;
        divMag.innerHTML = `Mag: <b>${mi.mag}</b>`;
        divCrd.innerHTML = `X: <b>${mi.crd.x.toFixed(2)}</b>; Y: <b>${mi.crd.y.toFixed(2)}</b>; Z: <b>${mi.crd.z.toFixed(2)}</b>`;
        label.position.copy(mi.crd);
        label.element.animate([
          {width: "0px", height: "0px", marginTop: "0px", marginLeft: "0px"},
          {width: "230px", height: "50px", marginTop: "-25px", maginLeft: "120px"}
        ],{
          duration: 250
        });
        label.element.classList.remove("hidden");
      }
    }
  });
  
  let clock = new THREE.Clock();
  
  renderer.setAnimationLoop(() => {
    let t = clock.getElapsedTime();
    globalUniforms.time.value = t;
    label.userData.trackVisibility();
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });
  
  function onWindowResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize(innerWidth, innerHeight);
    labelRenderer.setSize(innerWidth, innerHeight);
  }
  
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
  