let renderer, scene, camera, cameraControls;

    // 1. Inicialización
    function init() {
      // Inicializa el renderizador
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(new THREE.Color(0xFFFFFF)); // Fondo blanco
      document.getElementById('container').appendChild(renderer.domElement);

      // Inicializa la escena
      scene = new THREE.Scene();

      // Cámara
      var aspectRatio = window.innerWidth / window.innerHeight;
      camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000);
      camera.position.set(0, 100, 500);  // Alejamos y elevamos la cámara para una mejor visualización
      camera.lookAt(0, 100, 0);  // Mirar hacia el centro de la escena

      // Controles de cámara
      cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
      cameraControls.target.set(0, 0, 0); // Fija el punto de mira en el origen

      // Escucha cambios en el tamaño de la ventana
      window.addEventListener('resize', updateAspectRatio);
    }

    // Función para crear una pinza
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
  // Base más grande (19 de anchura, 4 de profundidad) ahora ajustada en el plano X-Y
  -19/2, 0, -2,  // vértice 0 (esquina inferior izquierda)
  19/2, 0, -2,  // vértice 1 (esquina inferior derecha)
  19/2, 0,  2,  // vértice 2 (esquina superior derecha)
  -19/2, 0,  2,  // vértice 3 (esquina superior izquierda)

  // Base más pequeña en la parte superior (estrechada)
  -5, 19, -1,  // vértice 4 (esquina inferior izquierda, más pequeña)
   5, 19, -1,  // vértice 5 (esquina inferior derecha, más pequeña)
   5, 19,  1,  // vértice 6 (esquina superior derecha, más pequeña)
  -5, 19,  1   // vértice 7 (esquina superior izquierda, más pequeña)
]);

const indices = [
  // Lados entre las bases
  0, 1, 5, 0, 5, 4, // Lado 1
  1, 2, 6, 1, 6, 5, // Lado 2
  2, 3, 7, 2, 7, 6, // Lado 3
  3, 0, 4, 3, 4, 7, // Lado 4

  // Base inferior (más grande)
  0, 1, 2, 2, 3, 0, // Base grande

  // Base superior (más pequeña)
  4, 5, 6, 6, 7, 4 // Base pequeña
];


geometryTrapezoid.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometryTrapezoid.setIndex(indices);
geometryTrapezoid.computeVertexNormals(); // Opcional: para el sombreado

const materialTrapezoid = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const trapezoid = new THREE.Mesh(geometryTrapezoid, materialTrapezoid);
trapezoid.rotation.z = -Math.PI / 2;
trapezoid.position.set(10,0,0); // Posicionar la pirámide encima de la caja
pinza.add(trapezoid);
return pinza;
}


    
    // 3. Carga de la escena
    function loadScene() {
      // Crear el nodo raíz "robot"
      const robot = new THREE.Object3D();

      // Crear el suelo (plano de 1000x1000 en XZ)
      const geometrySuelo = new THREE.PlaneGeometry(1000, 1000);
      const materialSuelo = new THREE.MeshBasicMaterial({ color: 0x89ac76, side: THREE.DoubleSide });
      const suelo = new THREE.Mesh(geometrySuelo, materialSuelo);
      suelo.rotation.x = -Math.PI / 2; // Rotar para que esté en el plano XZ
      suelo.position.y = -7.5; // Colocar el suelo en Y=0
    
      scene.add(suelo);

      // Crear la base del robot (cilindro)
      const geometryBase = new THREE.CylinderGeometry(50, 50, 15, 18); // Radio superior, radio inferior, altura, segmentos
      const materialBase = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // Color rojo, wireframe activado
      const base = new THREE.Mesh(geometryBase, materialBase);
      //base.position.set(0, 7.5, 0); // Elevar la base para que esté justo sobre el suelo
      robot.add(base); // Añadir base al robot

      // Crear el nodo "brazo" y añadir al nodo "base"
      const brazo = new THREE.Object3D();
      base.add(brazo); // Añadir el brazo a la base

      // Eje del brazo
      const geometryEje = new THREE.CylinderGeometry(20, 20, 18, 9); // Radio, radio, altura, segmentos
      const materialEje = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // Color rojo, wireframe activado
      const eje = new THREE.Mesh(geometryEje, materialEje);
      //eje.position.set(0, 0, 0); // Colocar el eje en el centro de la base
      eje.rotation.x = -Math.PI / 2; // Rotar para que esté en el plano
    
      brazo.add(eje); // Añadir eje al brazo

      // Esparrago del brazo
      const geometryEsparrago = new THREE.CylinderGeometry(10, 10, 120, 12); // Radio, radio, altura, segmentos
      const materialEsparrago = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // Color rojo, wireframe activado
      const esparrago = new THREE.Mesh(geometryEsparrago, materialEsparrago);
      esparrago.position.set(0, 120/2, 0); // Posicionar sobre el eje
      brazo.add(esparrago); // Añadir esparrago al brazo

      // Rótula del brazo (esfera)
      const geometryRotula = new THREE.SphereGeometry(20, 12, 12); // Radio, segmentos verticales, segmentos horizontales
      const materialRotula = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // Color rojo, wireframe activado
      const rotula = new THREE.Mesh(geometryRotula, materialRotula);
      rotula.position.set(0, 120, 0); // Posicionar sobre el esparrago
      brazo.add(rotula); // Añadir rótula al brazo

      // *** Añadir el antebrazo ***
      const antebrazo = new THREE.Object3D();
      rotula.add(antebrazo); // Añadir el antebrazo a la rótula

      // Disco del antebrazo (Radio=22, Altura=6)
      const geometryDisco = new THREE.CylinderGeometry(22, 22, 6, 12); // Radio superior, radio inferior, altura, segmentos
      const materialDisco = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
      const disco = new THREE.Mesh(geometryDisco, materialDisco);
      disco.position.set(0, 0, 0); // Posicionar sobre la rótula
      antebrazo.add(disco); // Añadir el disco al antebrazo

      // Nervios del antebrazo (4 nervios, tamaño 4x80x4)
      const geometryNervio = new THREE.BoxGeometry(4, 80, 4); // Nervios como cajas delgadas
      const materialNervio = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
      for (let i = 0; i < 4; i++) {
        const nervio = new THREE.Mesh(geometryNervio, materialNervio);
        const angle = (i * Math.PI) / 2; // Espaciados uniformemente en 90 grados
        nervio.position.set(12 * Math.cos(angle), 40, 12 * Math.sin(angle)); // Posicionar alrededor del disco
        antebrazo.add(nervio); // Añadir los nervios al antebrazo
      }

      // Cilindro del antebrazo, mano del robot  (Radio=15, Altura=40)
      const geometryCilindroAntebrazo = new THREE.CylinderGeometry(15,15, 40, 32); // Radio 22, altura 6
      const cilindroAntebrazo = new THREE.Mesh(geometryCilindroAntebrazo, materialDisco);
      cilindroAntebrazo.position.set(0, 80, 0); // Posicionar encima de los nervios
      cilindroAntebrazo.rotation.x = -Math.PI / 2; // Rotar para que esté en el plano
      antebrazo.add(cilindroAntebrazo); // Añadir cilindro del antebrazo
      


      // Añadir las pinzas a la mano del robot (cilindroAntebrazo)
      const pinza1 = crearPinza();
      pinza1.position.set(10, 80, 10); // Ajustar la posición basado en el cilindro

      const pinza2 = crearPinza();
      pinza2.position.set(10, 80, -10); // Espejar la posición de la segunda pinza
    

      antebrazo.add(pinza1);
      antebrazo.add(pinza2);
      // Añadir el robot completo a la escena
      scene.add(robot);
    }

    // 4. Renderizado
    function render() {
      requestAnimationFrame(render);
      cameraControls.update(); // Actualiza los controles de la cámara
      renderer.render(scene, camera);
    }

    // 5. Actualizar el tamaño de la ventana
    function updateAspectRatio() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Inicializa todo y carga la escena
    init();
    loadScene();
    render();