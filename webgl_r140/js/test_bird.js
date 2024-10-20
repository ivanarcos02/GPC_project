const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

// Configuración de la luz
const light = new THREE.SpotLight(0xffffff, 1); // Reduje la intensidad
light.position.set(5, 5, 5);
light.castShadow = true; // Habilitar sombras para la luz
light.shadow.bias = -0.003;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
scene.add(light);

// Configuración de la cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

// Configuración del renderizador
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true; // Habilitar sombras
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de la cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Carga del modelo GLTF
const loader = new THREE.GLTFLoader();
loader.load(
  'models/bird.glb',
  function (gltf) {
    // Configuración para habilitar sombras en los objetos del modelo
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Añadir el modelo a la escena
    gltf.scene.position.set(0, 0, 0); // Asegúrate de que el modelo esté en la posición correcta
    scene.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.log(error);
  }
);

// Escuchar cambios en el tamaño de la ventana
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

// Función de animación
function animate() {
  requestAnimationFrame(animate);

  // Actualizar los controles de la cámara
  controls.update();

  render();
}

// Función de renderizado
function render() {
  renderer.render(scene, camera);
}

animate();

// Añadir un cubo para verificar si la escena se renderiza correctamente
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(-2, 0, 0); // Posicionarlo para que no se superponga al modelo
scene.add(cube);
