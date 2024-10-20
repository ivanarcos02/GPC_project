// Crear la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Añadir luces a la escena
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Controles de la cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Crear el material para los peldaños de la escalera
const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x00FFFF });

// Crear el suelo (un plano grande)
const floorGeometry = new THREE.PlaneGeometry(50, 50); // Suelo de 50x50 unidades
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x00FFFF }); // Color gris para el suelo
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotar el plano para que esté horizontal
floor.position.y = -0.25; // Colocar el suelo debajo de los peldaños
scene.add(floor);

// Crear y añadir peldaños a la escena
const stepWidth = 2; // Ancho del peldaño
const stepHeight = 0.5; // Altura del peldaño
const stepDepth = 1; // Profundidad del peldaño

const numberOfSteps = 20; // Número de peldaños

for (let i = 0; i < numberOfSteps; i++) {
  // Crear un BoxGeometry para cada peldaño
  const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);

  // Crear la malla del peldaño
  const step = new THREE.Mesh(stepGeometry, stepMaterial);

  // Posicionar cada peldaño para formar una escalera
  step.position.set(0, i * stepHeight, i * stepDepth);

  // Añadir el peldaño a la escena
  scene.add(step);
}

// Posicionar la cámara
camera.position.z = 5;
camera.position.y = 3;

// Animar la escena
function animate() {
  requestAnimationFrame(animate);

  // Rotar la cámara para visualizar la escalera
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Ajustar el tamaño de la ventana
window.addEventListener('resize', function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
