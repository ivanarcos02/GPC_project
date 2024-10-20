let renderer, scene, camera, cameraControls, miniMapCamera, miniMapRenderer, robot, base, brazo, antebrazo, pinza1, pinza2;
function init() {
  // Inicializa el renderizador
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0xFFFFFF)); // Fondo blanco
  document.getElementById('container').appendChild(renderer.domElement);

  // Inicializa el renderizador de la vista miniatura (para el minimapa)

miniMapRenderer = new THREE.WebGLRenderer();
miniMapRenderer.setSize(window.innerWidth / 6, window.innerWidth / 6); // Smaller size (1/6th of the main view width)
miniMapRenderer.setClearColor(new THREE.Color(0xFFFFFF)); // White background for the minimap
miniMapRenderer.domElement.style.position = "absolute";
miniMapRenderer.domElement.style.top = "10px";  // Adjust as needed for spacing from top
miniMapRenderer.domElement.style.left = "10px"; // Adjust as needed for spacing from left
miniMapRenderer.domElement.style.border = "2px solid #000"; // Optional border for visibility
document.body.appendChild(miniMapRenderer.domElement);

  // Inicializa la escena
  scene = new THREE.Scene();

  // Cámara principal
  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000);
  camera.position.set(0, 100, 500);  // Alejamos y elevamos la cámara para una mejor visualización
  camera.lookAt(0, 100, 0);  // Mirar hacia el centro de la escena

  // Controles de cámara
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.enableDamping = true; // Efecto de amortiguación suave
  cameraControls.dampingFactor = 0.05;
  cameraControls.enableZoom = true; // Zoom con la rueda
  cameraControls.enablePan = true; // Permitir desplazamiento (panning)
  cameraControls.screenSpacePanning = false;
  cameraControls.maxPolarAngle = Math.PI / 2; // Limita la rotación para no pasar por debajo

  // Vista cenital (miniatura)
  miniMapCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 2000); // Proporciones cuadradas 1:1
  miniMapCamera.position.set(0, 1000, 0); // Posicionada muy arriba para una vista cenital
  miniMapCamera.lookAt(0, 0, 0); // Mirando hacia el centro de la escena

  // Escucha cambios en el tamaño de la ventana
  window.addEventListener('resize', updateAspectRatio);
  initKeyboardControls();
}

function initKeyboardControls() {
    window.addEventListener('keydown', function(event) {
      switch (event.code) {
        case 'ArrowUp':
          controls.moveRobotZ -= 10; // Mover hacia adelante en el eje Z
          break;
        case 'ArrowDown':
          controls.moveRobotZ += 10; // Mover hacia atrás en el eje Z
          break;
        case 'ArrowLeft':
          controls.moveRobotX -= 10; // Mover hacia la izquierda en el eje X
          break;
        case 'ArrowRight':
          controls.moveRobotX += 10; // Mover hacia la derecha en el eje X
          break;
      }
      updateRobotPosition();
    });
  }
  


function crearPinza() {
  const pinza = new THREE.Object3D();

  // Crear la caja (paralelepípedo)
  const geometryCaja = new THREE.BoxGeometry(20, 19, 4); 
  const materialCaja = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const caja = new THREE.Mesh(geometryCaja, materialCaja);
  caja.position.set(0, 0, 0); // Posicionar la caja para que esté alineada con la parte piramidal

  pinza.add(caja);

  // Crear la parte piramidal usando BufferGeometry
  const geometryTrapezoid = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -19/2, 0, -2,  19/2, 0, -2,  19/2, 0,  2, -19/2, 0,  2,
    -5, 19, -1,  5, 19, -1,  5, 19,  1, -5, 19,  1
  ]);
  
  const indices = [0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7, 0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4];
  
  geometryTrapezoid.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometryTrapezoid.setIndex(indices);
  geometryTrapezoid.computeVertexNormals();

  const materialTrapezoid = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const trapezoid = new THREE.Mesh(geometryTrapezoid, materialTrapezoid);
  trapezoid.rotation.z = -Math.PI / 2;
  trapezoid.position.set(10, 0, 0);
  pinza.add(trapezoid);

  return pinza;
}

function loadScene() {
  // Crear el nodo raíz "robot"
  robot = new THREE.Object3D();

  // Crear el suelo (plano de 1000x1000 en XZ)
  const geometrySuelo = new THREE.PlaneGeometry(1000, 1000);
  const materialSuelo = new THREE.MeshBasicMaterial({ color: 0x89ac76, side: THREE.DoubleSide , wireframe: true });
  const suelo = new THREE.Mesh(geometrySuelo, materialSuelo);
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -7.5;
  scene.add(suelo);

  // Crear la base del robot
  const geometryBase = new THREE.CylinderGeometry(50, 50, 15, 18);
  const materialBase = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  base = new THREE.Mesh(geometryBase, materialBase);
  robot.add(base);

  // Crear el brazo del robot
  brazo = new THREE.Object3D();
  base.add(brazo);

  const geometryEje = new THREE.CylinderGeometry(20, 20, 18, 9);
  const materialEje = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const eje = new THREE.Mesh(geometryEje, materialEje);
  eje.rotation.x = -Math.PI / 2;
  brazo.add(eje);

  const geometryEsparrago = new THREE.CylinderGeometry(10, 10, 120, 12);
  const materialEsparrago = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const esparrago = new THREE.Mesh(geometryEsparrago, materialEsparrago);
  esparrago.position.set(0, 120/2, 0);
  brazo.add(esparrago);

  const geometryRotula = new THREE.SphereGeometry(20, 12, 12);
  const materialRotula = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const rotula = new THREE.Mesh(geometryRotula, materialRotula);
  rotula.position.set(0, 120, 0);
  brazo.add(rotula);

  // Crear el antebrazo del robot
  antebrazo = new THREE.Object3D();
  rotula.add(antebrazo);

  const geometryDisco = new THREE.CylinderGeometry(22, 22, 6, 12);
  const materialDisco = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  const disco = new THREE.Mesh(geometryDisco, materialDisco);
  antebrazo.add(disco);

  const geometryNervio = new THREE.BoxGeometry(4, 80, 4);
  for (let i = 0; i < 4; i++) {
    const nervio = new THREE.Mesh(geometryNervio, materialDisco);
    const angle = (i * Math.PI) / 2;
    nervio.position.set(12 * Math.cos(angle), 40, 12 * Math.sin(angle));
    antebrazo.add(nervio);
  }

  // Cilindro del antebrazo, mano del robot  (Radio=15, Altura=40)
  const geometryCilindroAntebrazo = new THREE.CylinderGeometry(15,15, 40, 32); // Radio 22, altura 6
  cilindroAntebrazo = new THREE.Mesh(geometryCilindroAntebrazo, materialDisco);
  cilindroAntebrazo.position.set(0, 80, 0); // Posicionar encima de los nervios
  cilindroAntebrazo.rotation.x = -Math.PI / 2; // Rotar para que esté en el plano
  antebrazo.add(cilindroAntebrazo); // Añadir cilindro del antebrazo
  
  // Añadir las pinzas al cilindro del antebrazo (en vez del antebrazo)
  pinza1 = crearPinza();
  pinza1.rotation.x = -Math.PI / 2; // Rotar para que esté en el plano
  pinza1.position.set(10, -10, 0); // Cambiar la posición en relación al cilindro
  pinza2 = crearPinza();
  pinza2.rotation.x = -Math.PI / 2; // Rotar para que esté en el plano
  pinza2.position.set(10, 10, 0); // Cambiar la posición en relación al cilindro
  cilindroAntebrazo.add(pinza1);  // Añadir al cilindro
  cilindroAntebrazo.add(pinza2);  // Añadir al cilindro

  // Añadir el robot completo a la escena
  scene.add(robot);
}


function updateAspectRatio() {
  // Actualiza el tamaño de la cámara principal
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Actualiza el tamaño del renderizador de la vista cenital (miniatura)
  const size = Math.min(window.innerWidth, window.innerHeight) / 4;
  miniMapRenderer.setSize(size, size);
}

// Creación de la interfaz GUI
let gui, controls;
function createGUI() {
  gui = new lil.GUI();
  controls = {
    moveRobotX: 0,
    moveRobotZ: 0,
    rotateBase: 0,
    rotateArm: 0,
    rotateForearmY: 0,
    rotateForearmZ: 0,
    rotateClaw: 0,
    openClaw: 0,
    wireframe: true,
    animate: animateRobot
  };

  gui.add(controls, 'moveRobotX', -500, 500).name('Mover Robot X').onChange(updateRobotPosition);
  gui.add(controls, 'moveRobotZ', -500, 500).name('Mover Robot Z').onChange(updateRobotPosition);
  gui.add(controls, 'rotateBase', -180, 180).name('Giro Base').onChange(updateBaseRotation);
  gui.add(controls, 'rotateArm', -45, 45).name('Giro Brazo').onChange(updateArmRotation);
  gui.add(controls, 'rotateForearmY', -180, 180).name('Giro Antebrazo Y').onChange(updateForearmRotationY);
  gui.add(controls, 'rotateForearmZ', -90, 90).name('Giro Antebrazo Z').onChange(updateForearmRotationZ);
  gui.add(controls, 'rotateClaw', -40, 220).name('Rotar Pinza').onChange(updateClawRotation);
  gui.add(controls, 'openClaw', -5, 15).name('Abrir/Cerrar Pinza').onChange(updateClawOpen);
  gui.add(controls, 'wireframe').name('Alámbrico/Sólido').onChange(toggleWireframe);
  gui.add(controls, 'animate').name('Iniciar Animación');
}

function updateRobotPosition() {
  robot.position.set(controls.moveRobotX, 0, controls.moveRobotZ);
}

function updateBaseRotation() {
  base.rotation.y = THREE.MathUtils.degToRad(controls.rotateBase);
}

function updateArmRotation() {
  brazo.rotation.z = THREE.MathUtils.degToRad(controls.rotateArm);
}

function updateForearmRotationY() {
  antebrazo.rotation.y = THREE.MathUtils.degToRad(controls.rotateForearmY);
}

function updateForearmRotationZ() {
  antebrazo.rotation.z = THREE.MathUtils.degToRad(controls.rotateForearmZ);
}

function updateClawRotation() {
  cilindroAntebrazo.rotation.y = THREE.MathUtils.degToRad(-controls.rotateClaw);
  //pinza2.rotation.z = THREE.MathUtils.degToRad(controls.rotateClaw);
}

function updateClawOpen() {
  pinza1.rotation.y = THREE.MathUtils.degToRad(-controls.openClaw);  
  pinza2.rotation.y = THREE.MathUtils.degToRad(controls.openClaw); 
}

function toggleWireframe() {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.wireframe = controls.wireframe;
    }
  });
}

function animateRobot() {
  const duration = 2000;

  new TWEEN.Tween(controls)
    .to({ rotateBase: 180 }, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(updateBaseRotation)
    .start();

  new TWEEN.Tween(controls)
    .to({ rotateArm: 45 }, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(updateArmRotation)
    .start();
  
  new TWEEN.Tween(controls)
    .to({ openClaw: 15 }, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(updateClawOpen)
    .start();
}

function render() {
  requestAnimationFrame(render);
  cameraControls.update();
  renderer.render(scene, camera);
  miniMapRenderer.render(scene, miniMapCamera);
  TWEEN.update();
}

// Inicializa todo y carga la escena
init();
loadScene();
createGUI();
render();
