import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
// Initialize Three.js scene

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

const loader = new GLTFLoader();
// full light
// const amblight = new THREE.AmbientLight(0xffffff, 0.9);
// amblight.castShadow = true;
// scene.add(amblight);

const robotMessage = document.createElement("div");
robotMessage.classList.add("robotMessage");
robotMessage.innerHTML = "Take me near the moon";

// //directional
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.castShadow = true;
directionalLight.position.set(0, 32, 64);

// Create a point light
const light = new THREE.PointLight(0xffffff, 500, 0);
light.position.set(0, 6, 2); // Adjust the position as needed
scene.add(light);

// Set the initial state for the blinking effect
let isLightOn = true;

// Function to toggle the light on/off in a blinking pattern
function toggleLight() {
  isLightOn = !isLightOn;
  light.visible = isLightOn;

  // Define the interval for the blinking pattern (e.g., 1 second on, 1 second off)
  const interval = isLightOn ? 1000 : 1000; // Adjust the duration as needed

  setTimeout(toggleLight, interval);
}

// Start the blinking pattern
toggleLight();

let model;
let model2;
let moon;
let mixer;

moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
moon.position.set(-20, 20, -10);
gsap.to(moon.position, {
  duration: 2,
  x: 0,
  y: 3,
  z: 0,
  ease: "inOut",
});

//texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./models/moon.jpeg");
moon.material.map = texture;
scene.add(moon);

// Load your custom GLTF model
loader.load("./models/coming_soon.gltf", (gltf) => {
  model = gltf.scene;

  const bbox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scene.add(model);
  bbox.getCenter(center);

  // Calculate the offset needed to move the model to the center of the scene
  const offset = new THREE.Vector3();
  offset.subVectors(scene.position, center);

  // Apply the offset to the model's position
  model.position.add(offset);

  //make it a bit down
  model.position.y = -2;
});

loader.load("./models/ICT_HI.gltf", (gltf) => {
  model2 = gltf.scene;
  scene.add(model2);

  mixer = new THREE.AnimationMixer(model2);

  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  model2.position.set(-18, -7, -10);
  model2.rotation.y = 0.5;
  model2.scale.set(1, 1, 1);

  // Define variables for robot's position, orientation, and velocity
  const robotPosition = new THREE.Vector3(0, -20, -10);
  const robotOrientation = new THREE.Quaternion();
  const robotVelocity = new THREE.Vector3(0, 0, 0);

  // Set the robot's initial position and orientation
  model2.position.copy(robotPosition);
  model2.setRotationFromQuaternion(robotOrientation);

  document.addEventListener("keydown", (event) => {
    const robotSpeed = 0.1; // Adjust the speed as needed
    const rotateSpeed = 0.05; // Adjust the rotation speed as needed
    const resetKey = 32; // Space key

    switch (event.keyCode) {
      case 87: // W key or Up arrow key
        // Accelerate the robot forward along its orientation
        const forwardVector = new THREE.Vector3(0, 1, 0);
        forwardVector.applyQuaternion(robotOrientation);
        robotVelocity.add(
          forwardVector.clone().multiplyScalar(robotSpeed * 0.1)
        );

        break;
      case 83: // S key or Down arrow key
        // Decelerate the robot (apply reverse thrust)
        const backwardVector = new THREE.Vector3(0, -1, 0);
        backwardVector.applyQuaternion(robotOrientation);
        robotVelocity.add(
          backwardVector.clone().multiplyScalar(robotSpeed * 0.1)
        ); // Adjust reverse thrust as needed
        break;
      case 65: // A key or Left arrow key
        // Strafe the robot to the left
        const leftVector = new THREE.Vector3(-0.5, 0, 0);
        leftVector.applyQuaternion(robotOrientation);
        robotVelocity.add(leftVector.clone().multiplyScalar(robotSpeed * 0.2));
        break;
      case 68: // D key or Right arrow key
        // Strafe the robot to the right
        const rightVector = new THREE.Vector3(0.5, 0, 0);
        rightVector.applyQuaternion(robotOrientation);
        robotVelocity.add(rightVector.clone().multiplyScalar(robotSpeed * 0.2));
        break;
      case resetKey:
        // Reset robot position, orientation, and velocity to initial values when Space key is pressed
        gsap.to(robotPosition, {
          duration: 1,
          x: 0,
          y: -2,
          z: -10,
          onUpdate: () => {
            model2.position.copy(robotPosition);
          },
          onComplete: () => {
            robotVelocity.set(0, 0, 0);
            gsap.to(model2.rotation, {
              duration: 1,
              y: 6.3,
              ease: "inOut",
            });
          },
        });

        break;
    }

    //if the robots position is near the moon, then move the moon
    const distance = model2.position.distanceTo(moon.position);
    console.log(distance);

    if (distance < 10.5) {
      document.getElementById("message").style.display = "flex";
      //reset the robot
      gsap.to(robotPosition, {
        duration: 1,
        x: 0,
        y: -2,
        z: -10,
        onUpdate: () => {
          model2.position.copy(robotPosition);
        },
        onComplete: () => {
          robotVelocity.set(0, 0, 0);
          gsap.to(model2.rotation, {
            duration: 1,
            y: 6.3,
            ease: "inOut",
          });
        },
      });
    }
  });

  // Define the final y-position
  const finalYPosition = -2;

  // Animate the robot's initial movement
  gsap.to(robotPosition, {
    duration: 2,
    y: finalYPosition,
    onUpdate: () => {
      // Update the robot's position during the animation

      model2.position.copy(robotPosition);
    },
    onComplete: () => {
      //spinthe full robot once it reaches the final position
      gsap.to(model2.rotation, {
        duration: 1,
        y: 6.3,
        ease: "inOut",
      });
    },
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
const final = 5;

// Render the scene
const animate = () => {
  requestAnimationFrame(animate);
  moon.rotation.y += 0.01;
  if (mixer) {
    mixer.update(0.01); // You can pass a time delta here
  }

  // till the final position is reached, move the camera
  if (camera.position.z < final) {
    camera.position.z += 0.015;
  } else {
    scene.add(directionalLight);

    scene.remove(light);
  }

  renderer.render(scene, camera);
};

animate();
