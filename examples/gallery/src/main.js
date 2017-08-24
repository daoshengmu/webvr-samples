/* eslint-disable no-undef */
/* eslint-disable new-cap */

let camera, scene, renderer;
let materials = [];
let vrControls, vrEffect, vrDisplay, enterVR;
let mainSphere, tb1Mesh, tb2Mesh, tb3Mesh;
let rayInput;

const DEFAULT_COLOR = new THREE.Color(0xFFFFFF);
const HIGHLIGHT_COLOR = new THREE.Color(0x1E90FF);

function init () {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth /
                                       window.innerHeight, 0.1, 10000);
  scene = new THREE.Scene();

  // Setup three.js WebGL renderer.
  // Note: Antialiasing-enabled on mobile
  // will make renderer creation failed.
  renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);

  materials.push(new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('resource/puydesancy.jpg')
  }));
  materials.push(new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('resource/2294472375_24a3b8ef46_o.jpg')
  }));
  materials.push(new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('resource/lake.jpg')
  }));

  // Thumbnails
  let tb1 = new THREE.SphereGeometry(0.5, 60, 40);
  tb1Mesh = new THREE.Mesh(tb1, materials[0]);
  tb1Mesh.position.set(-1, -1, -3);
  scene.add(tb1Mesh);

  let tb2 = new THREE.SphereGeometry(0.5, 60, 40);
  tb2Mesh = new THREE.Mesh(tb2, materials[1]);
  tb2Mesh.position.set(0, -1, -3);
  scene.add(tb2Mesh);

  let tb3 = new THREE.SphereGeometry(0.5, 60, 40);
  tb3Mesh = new THREE.Mesh(tb3, materials[2]);
  tb3Mesh.position.set(1, -1, -3);
  scene.add(tb3Mesh);

  // Show paranoma in WebGL
  let geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  mainSphere = new THREE.Mesh(geometry, materials[0].clone());
  scene.add(mainSphere);

  // Initialize VR
  // Apply VR headset positional data to camera.
  vrControls = new THREE.VRControls(camera);
  vrEffect = new THREE.VREffect(renderer);
  vrEffect.setSize(window.innerWidth, window.innerHeight);

  let options = {};
  enterVR = new webvrui.EnterVRButton(renderer.domElement, options);
  document.body.appendChild(enterVR.domElement);

  enterVR.getVRDisplay().then((displays) => {
    if (displays.length > 0) {
      vrDisplay = displays[0];
    }
    createRayInput();
  }).catch(() => {
    // no vr display
    createRayInput();
  });

  animate();
}

function createRayInput () {
  rayInput = new RayInput.default(camera, renderer.domElement);
  rayInput.setSize(renderer.getSize());
  scene.add(rayInput.getMesh());

  // Register a callback whenever an object is acted on.
  rayInput.on('raydown', (mesh) => {
    // Called when an object was activated.
    // If there is a selected object, mesh is that object.
    if (mesh) {
      console.log('raydown...');
      mainSphere.material = mesh.material.clone();
      mainSphere.material.color = DEFAULT_COLOR;
    }
  });

  // Register a callback when an object is selected.
  rayInput.on('rayover', (mesh) => {
    // Called when an object was selected.
    console.log('rayover...');
    mesh.material.color = HIGHLIGHT_COLOR;
  });

  // Register a callback when an object is selected.
  rayInput.on('rayout', (mesh) => {
    // Called when an object was unselected.
    console.log('rayover...');
    mesh.material.color = DEFAULT_COLOR;
  });

  rayInput.add(tb1Mesh);
  rayInput.add(tb2Mesh);
  rayInput.add(tb3Mesh);
}

function onWindowResize () {
  vrEffect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  if (rayInput) {
    rayInput.setSize(renderer.getSize());
  }
}

function animate () {
  // Update the input system in a game loop.
  if (rayInput) {
    rayInput.update();
  }

  vrControls.update();

  if (enterVR.isPresenting()) {
    vrEffect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }

  if (vrDisplay) {
    vrDisplay.requestAnimationFrame(animate);
  } else {
    window.requestAnimationFrame(animate);
  }
}

window.addEventListener('load', init);
