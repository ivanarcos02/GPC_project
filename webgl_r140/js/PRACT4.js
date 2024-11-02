let renderer, scene, camera, cameraControls, miniMapCamera, miniMapRenderer, robot, base, brazo, antebrazo, cilindroAntebrazo, pinza1, pinza2;

function init() {
  // Inicializa el renderizador principal
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0xFFFFFF)); // Fondo blanco
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombra
  document.getElementById('container').appendChild(renderer.domElement);

  // Inicializa el renderizador de la vista miniatura (para el minimapa)
  miniMapRenderer = new THREE.WebGLRenderer({ antialias: true });
  miniMapRenderer.setSize(window.innerWidth / 6, window.innerWidth / 6); // Tamaño reducido
  miniMapRenderer.setClearColor(new THREE.Color(0xFFFFFF)); // Fondo blanco para el minimap
  miniMapRenderer.domElement.style.position = "absolute";
  miniMapRenderer.domElement.style.top = "10px";  // Ajustar según sea necesario
  miniMapRenderer.domElement.style.left = "10px"; // Ajustar según sea necesario
  miniMapRenderer.domElement.style.border = "2px solid #000"; // Borde opcional
  miniMapRenderer.shadowMap.enabled = true;
  document.body.appendChild(miniMapRenderer.domElement);

  // Inicializa la escena
  scene = new THREE.Scene();

  // Cámara principal
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000);
  camera.position.set(0, 200, 500);  // Alejamos y elevamos la cámara para una mejor visualización
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
  const materialCaja = new THREE.MeshStandardMaterial({ color: 0xDC143C, metalness: 0.6, roughness: 0.4 }); // Carmesí
  const caja = new THREE.Mesh(geometryCaja, materialCaja);
  caja.position.set(0, 0, 0); // Posicionar la caja para que esté alineada con la parte piramidal
  caja.castShadow = true;
  caja.receiveShadow = true;
  pinza.add(caja);

  // Crear la parte piramidal usando BufferGeometry
  const geometryTrapezoid = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -19/2, 0, -2,  19/2, 0, -2,  19/2, 0,  2, -19/2, 0, 2,
    -5, 19, -1,  5, 19, -1,  5, 19,  1, -5, 19,  1
  ]);
  
  const indices = [0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7, 0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4];
  
  geometryTrapezoid.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometryTrapezoid.setIndex(indices);
  geometryTrapezoid.computeVertexNormals();

  const materialTrapezoid = new THREE.MeshStandardMaterial({ color: 0xDC143C, metalness: 0.6, roughness: 0.4 }); // Carmesí
  const trapezoid = new THREE.Mesh(geometryTrapezoid, materialTrapezoid);
  trapezoid.rotation.z = -Math.PI / 2;
  trapezoid.position.set(10, 0, 0);
  trapezoid.castShadow = true;
  trapezoid.receiveShadow = true;
  pinza.add(trapezoid);

  return pinza;
}

function loadScene() {
  // Crear el nodo raíz "robot"
  robot = new THREE.Object3D();

  // Agregar luz ambiental
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5); // Luz ambiental blanca suave
  scene.add(ambientLight);

  // Agregar luz direccional
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
  directionalLight.position.set(200, 500, 300);
  directionalLight.castShadow = true; // Habilitar sombras
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 1500;
  directionalLight.shadow.camera.left = -500;
  directionalLight.shadow.camera.right = 500;
  directionalLight.shadow.camera.top = 500;
  directionalLight.shadow.camera.bottom = -500;
  scene.add(directionalLight);

  // Crear el suelo (plano de 1000x1000 en XZ)
  const geometrySuelo = new THREE.PlaneGeometry(1000, 1000);
  const materialSuelo = new THREE.MeshStandardMaterial({ color: 0x8B8B8B, side: THREE.DoubleSide, metalness: 0.3, roughness: 0.8 }); // Gris Medio
  const suelo = new THREE.Mesh(geometrySuelo, materialSuelo);
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.y = -7.5;
  suelo.receiveShadow = true; // Habilitar recepción de sombras
  scene.add(suelo);

  // Crear la base del robot
  const geometryBase = new THREE.CylinderGeometry(50, 50, 15, 32);
  const materialBase = new THREE.MeshStandardMaterial({ color: 0xB0C4DE, metalness: 0.7, roughness: 0.3 }); // Acero Claro
  base = new THREE.Mesh(geometryBase, materialBase);
  base.castShadow = true; // Habilitar lanzamiento de sombras
  base.receiveShadow = true;
  robot.add(base);

  // Crear el brazo del robot
  brazo = new THREE.Object3D();
  base.add(brazo);

  // Eje del brazo
  const geometryEje = new THREE.CylinderGeometry(20, 20, 18, 32);
  const materialEje = new THREE.MeshStandardMaterial({ color: 0x4682B4, metalness: 0.8, roughness: 0.2 }); // Azul Acero
  const eje = new THREE.Mesh(geometryEje, materialEje);
  eje.rotation.x = -Math.PI / 2;
  eje.castShadow = true;
  eje.receiveShadow = true;
  brazo.add(eje);

  // Esparrago del brazo
  const geometryEsparrago = new THREE.CylinderGeometry(10, 10, 120, 32);
  const materialEsparrago = new THREE.MeshStandardMaterial({ color: 0xB0E0E6, metalness: 0.8, roughness: 0.2 }); // Azul Polvo
  const esparrago = new THREE.Mesh(geometryEsparrago, materialEsparrago);
  esparrago.position.set(0, 60, 0); // Posicionar en el brazo
  esparrago.castShadow = true;
  esparrago.receiveShadow = true;
  brazo.add(esparrago);

  // Rótula del brazo
  const geometryRotula = new THREE.SphereGeometry(20, 32, 32);
  const materialRotula = new THREE.MeshStandardMaterial({ color: 0xCD5C5C, metalness: 0.7, roughness: 0.3 }); // Café Rojo
  const rotula = new THREE.Mesh(geometryRotula, materialRotula);
  rotula.position.set(0, 120, 0);
  rotula.castShadow = true;
  rotula.receiveShadow = true;
  brazo.add(rotula);

  // Crear el antebrazo del robot
  antebrazo = new THREE.Object3D();
  rotula.add(antebrazo);

  // Disco del antebrazo
  const geometryDisco = new THREE.CylinderGeometry(22, 22, 6, 32);
  const materialDisco = new THREE.MeshStandardMaterial({ color: 0x708090, metalness: 0.8, roughness: 0.2 }); // Gris Pizarra
  const disco = new THREE.Mesh(geometryDisco, materialDisco);
  disco.castShadow = true;
  disco.receiveShadow = true;
  antebrazo.add(disco);

  // Nervios del antebrazo
  const geometryNervio = new THREE.BoxGeometry(4, 80, 4);
  const materialNervio = new THREE.MeshStandardMaterial({ color: 0x708090, metalness: 0.8, roughness: 0.2 }); // Gris Pizarra
  for (let i = 0; i < 4; i++) {
    const nervio = new THREE.Mesh(geometryNervio, materialNervio);
    const angle = (i * Math.PI) / 2;
    nervio.position.set(12 * Math.cos(angle), 40, 12 * Math.sin(angle));
    nervio.castShadow = true;
    nervio.receiveShadow = true;
    antebrazo.add(nervio);
  }

  // Cilindro del antebrazo
  const geometryCilindroAntebrazo = new THREE.CylinderGeometry(15, 15, 40, 32);
  const materialCilindroAntebrazo = new THREE.MeshStandardMaterial({ color: 0x708090, metalness: 0.7, roughness: 0.3 }); // Gris Pizarra
  cilindroAntebrazo = new THREE.Mesh(geometryCilindroAntebrazo, materialCilindroAntebrazo);
  cilindroAntebrazo.position.set(0, 80, 0);
  cilindroAntebrazo.rotation.x = -Math.PI / 2;
  cilindroAntebrazo.castShadow = true;
  cilindroAntebrazo.receiveShadow = true;
  antebrazo.add(cilindroAntebrazo);

  // Añadir las pinzas al cilindro del antebrazo
  pinza1 = crearPinza();
  pinza1.rotation.x = -Math.PI / 2;
  pinza1.position.set(10, -10, 0);
  cilindroAntebrazo.add(pinza1);

  pinza2 = crearPinza();
  pinza2.rotation.x = -Math.PI / 2;
  pinza2.position.set(10, 10, 0);
  cilindroAntebrazo.add(pinza2);

  // Añadir el robot completo a la escena
  scene.add(robot);
}

function updateAspectRatio() {
  // Actualiza el tamaño de la cámara principal
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Actualiza el tamaño del renderizador de la vista cenital (miniatura)
  const size = Math.min(window.innerWidth, window.innerHeight) / 6;
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
    wireframe: false, // Cambiar a false por defecto
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
  // pinza2.rotation.z = THREE.MathUtils.degToRad(controls.rotateClaw);
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

