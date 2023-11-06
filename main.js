import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

//animate the countdown

const tl = gsap.timeline({ defaults: { ease: "power1.out" } });

tl.to(".text", { y: "0%", duration: 1, stagger: 0.25 });
tl.to(".slider", { y: "-100%", duration: 1.5, delay: 0.5 });
tl.to(".intro", { y: "-100%", duration: 1 }, "-=1");
tl.fromTo(
  ".container",
  { opacity: 0 },
  { opacity: 1, duration: 1, delay: 0.5 }
);

const t2 = gsap.timeline({ defaults: { ease: "power1.out" } });
t2.to(".text2", { y: "0%", duration: 1, stagger: 0.25 });
t2.to(".slider2", { y: "-100%", duration: 1.5, delay: 0.5 });
t2.to(".intro2", { y: "-100%", duration: 1 }, "-=1");
t2.fromTo(
  ".coming-soon",
  { opacity: 0 },
  { opacity: 1, duration: 1, delay: 0.5 }
);

// function countdown() {
//   const second = 1000,
//     minute = second * 60,
//     hour = minute * 60,
//     day = hour * 24;

//   let today = new Date(),
//     dd = String(today.getDate()).padStart(2, "0"),
//     mm = String(today.getMonth() + 1).padStart(2, "0"),
//     yyyy = today.getFullYear(),
//     nextYear = yyyy + 1,
//     dayMonth = "01/09/",
//     birthday = dayMonth + yyyy;

//   today = mm + "/" + dd + "/" + yyyy;
//   if (today > birthday) {
//     birthday = dayMonth + nextYear;
//   }
//   //end

//   const countDown = new Date(birthday).getTime(),
//     x = setInterval(function () {
//       const now = new Date().getTime(),
//         distance = countDown - now;

//       (document.getElementById("days").innerText = Math.floor(distance / day)),
//         (document.getElementById("hours").innerText = Math.floor(
//           (distance % day) / hour
//         )),
//         (document.getElementById("minutes").innerText = Math.floor(
//           (distance % hour) / minute
//         )),
//         (document.getElementById("seconds").innerText = Math.floor(
//           (distance % minute) / second
//         ));
//     }, 0);
// }

// countdown();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);
}

window.addEventListener("resize", onWindowResize, false);

//scene background
// scene.background = new THREE.Color(0x000000);
// transparent background

const loader = new GLTFLoader();
// full light
const amblight = new THREE.AmbientLight(0x79668a, 5);
amblight.position.set(0, 0, 0);
scene.add(amblight);

const robotMessage = document.createElement("div");
robotMessage.classList.add("robotMessage");
robotMessage.innerHTML = "Take me near the moon";

// //directional
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.castShadow = true;
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight("#00aaff", "#fedb95", 5);
hemisphereLight.position.set(0, 7, -0.3);
scene.add(hemisphereLight);

let model;
let model2;
let mixer;

// Load your custom GLTF model
// if (window.innerWidth > 1000) {
//   loader.load("./models/coming_soon.gltf", (gltf) => {
//     model = gltf.scene;

//     const bbox = new THREE.Box3().setFromObject(model);
//     const center = new THREE.Vector3();
//     scene.add(model);
//     bbox.getCenter(center);

//     // Calculate the offset needed to move the model to the center of the scene
//     const offset = new THREE.Vector3();
//     offset.subVectors(scene.position, center);

//     // Apply the offset to the model's position
//     model.position.add(offset);

//     //make it a bit down
//     model.position.y = -2;
//   });
// }

const eyeGlowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    glowColor: { value: new THREE.Color(0x11b4f8) }, // Change the color as needed
    coefficient: { value: 1.3 },
  },
  vertexShader: `
        uniform float coefficient;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform vec3 glowColor;
        uniform float coefficient;
        void main() {
            vec3 glow = glowColor * coefficient;
            gl_FragColor = vec4(glow, 1.0);
        }
    `,
  blending: THREE.AdditiveBlending,
  transparent: true,
});

loader.load("./models/robot.gltf", (gltf) => {
  model2 = gltf.scene;
  scene.add(model2);

  mixer = new THREE.AnimationMixer(model2);

  model2.traverse((o) => {
    if (o.isMesh) {
      if (o.name === "eyes") {
        //glow effect
        //bloomPass

        o.material = eyeGlowMaterial;
      }
    }
  });

  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  model2.rotation.y = 0;
  if (window.innerWidth > 500) {
    model2.scale.set(2.2, 2.2, 2.2);
  } else {
    model2.scale.set(1.8, 1.8, 1.8);
  }
  // Define variables for robot's position, orientation, and velocity
  const robotPosition = new THREE.Vector3(0, -16, -10);
  const robotOrientation = new THREE.Quaternion();
  const robotVelocity = new THREE.Vector3(0, 0, 0);

  // Set the robot's initial position and orientation
  model2.position.copy(robotPosition);
  model2.setRotationFromQuaternion(robotOrientation);

  // Define the final y-position
  const finalYPosition = window.innerWidth > 1000 ? -5 : -3;
  const finalXPosition = window.innerWidth > 1000 ? 0 : 0;

  // Animate the robot's initial movement
  gsap.to(robotPosition, {
    duration: 2,
    y: finalYPosition,
    x: finalXPosition,
    onUpdate: () => {
      // Update the robot's position during the animation

      model2.position.copy(robotPosition);
    },

    //make the model straight
  });

  // Update the robot's position based on velocity in an animation loop
  function robot() {
    // Update the robot's position based on velocity
    robotPosition.add(robotVelocity);

    // Set the robot's position and orientation in the 3D scene
    model2.position.copy(robotPosition);
    model2.setRotationFromQuaternion(robotOrientation);

    // Call robot recursively to create a continuous animation loop
    requestAnimationFrame(robot);
  }

  // Start the animation loop
  robot();
});

// Position the camera
camera.position.z = 0;
camera.position.y = 0;
const final = 5;

const animate = () => {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(0.01); // You can pass a time delta here
  }

  // till the final position is reached, move the camera
  if (camera.position.z < final) {
    camera.position.z += 0.015;
  } else {
  }

  renderer.render(scene, camera);
};

animate();
