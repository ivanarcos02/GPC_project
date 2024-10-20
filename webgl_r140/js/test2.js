function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 1, 1.5, 2 );
  camera.lookAt(0,0,0);

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


// Crear materiales
const material1 = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Rojo
const material2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Verde
const material3 = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Azul
const material4 = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Amarillo

// Crear mallas (figuras) y añadirlas a la escena
const cube = new THREE.Mesh(cubeGeometry, material1);
cube.position.x = -3;
scene.add(cube);

const sphere = new THREE.Mesh(sphereGeometry, material2);
sphere.position.x = 0;
scene.add(sphere);

const cone = new THREE.Mesh(coneGeometry, material3);
cone.position.x = 3;
scene.add(cone);

const cylinder = new THREE.Mesh(cylinderGeometry, material4);
cylinder.position.x = 6;
scene.add(cylinder);

// Posicionar la cámara
camera.position.z = 5;

// Animar la escena
function animate() {
  requestAnimationFrame(animate);

  // Rotar las figuras
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.01;

  cone.rotation.x += 0.01;
  cone.rotation.y += 0.01;

  cylinder.rotation.x += 0.01;
  cylinder.rotation.y += 0.01;

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
