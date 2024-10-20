
// Crear escena
const scene = new THREE.Scene();

// Crear cámara en 3ª persona (inicialmente)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Vista desde 3ª persona

// Crear la cámara del minimapa
const minimapCamera = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 1000);
minimapCamera.position.set(5, 1, 10);  // Posicionar por encima del escenario
minimapCamera.lookAt(10, 1, 0);         // Mirar hacia abajo

// Crear renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear contenedor para el minimapa
const minimapContainer = document.createElement('div');
minimapContainer.style.position = 'absolute';
minimapContainer.style.top = '10px';         // Cambiar de bottom a top
minimapContainer.style.left = '10px';        // Cambiar de right a left
minimapContainer.style.width = '200px';      // Debe coincidir con el tamaño del minimapa
minimapContainer.style.height = '200px';     // Debe coincidir con el tamaño del minimapa
minimapContainer.style.border = '3px solid white';  // Borde blanco
minimapContainer.style.borderRadius = '10px';  // Bordes redondeados
minimapContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';  // Fondo oscuro semi-transparente
minimapContainer.style.padding = '0px';  // Evitar padding que distorsione el tamaño
minimapContainer.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.5)';  // Sombra
document.body.appendChild(minimapContainer); 
// Crear renderizador para el minimapa
const minimapRenderer = new THREE.WebGLRenderer({ antialias: true });
minimapRenderer.setSize(200, 200);  // Tamaño del minimapa
minimapContainer.appendChild(minimapRenderer.domElement);  // Añadir el canvas del minimapa al contenedor

// Añadir luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);
     
//   Crear el jugador (pájaro)
//const birdGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
//const birdMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
//const bird = new THREE.Mesh(birdGeometry, birdMaterial);
//scene.background = new THREE.Color(0x87CEEB)
//scene.add(bird)       
 //Posición inicial del pájaro
//bird.position.set(0, 1, 0);

scene.background = new THREE.Color(0x87CEEB)

// Cargar una textura como fondo
const textureLoader = new THREE.TextureLoader();
textureLoader.load('textures/sky.jpg', function(texture) {
    scene.background = texture;  // Añadir la textura como fondo
});

// Carga del modelo GLTF
let bird;  // Define la variable "bird" para guardar el modelo cargado

const loader = new THREE.GLTFLoader();
loader.load(
  'models/bird2.glb',
  function (gltf) {

    // Asigna el modelo cargado a la variable "bird"
    bird = gltf.scene;
    
    // Posiciona el modelo correctamente si es necesario
    bird.position.set(0, 1, 0);  // Cambia la posición del modelo (levanta el pájaro en el eje Y)
    
    // Escala el modelo para hacerlo más pequeño
    bird.scale.set(0.4, 0.4, 0.4);  // Cambia los valores según sea necesario para reducir el tamaño
    
    // Rotación para que mire hacia el eje X (el frente del pájaro debe mirar hacia adelante en el eje X)
    bird.rotation.y = Math.PI / 2;  // Gira 90 grados en el eje Y para que mire hacia el eje X
    
    // Añade el modelo a la escena
    scene.add(bird);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.log(error);
  }
);



// Variables de movimiento del pájaro
let velocity = 0;
let gravity = -0.005;
let jumpStrength = 0.07;


// Crear la interfaz gráfica (GUI)
let gui, controls;
function createGUI() {
    gui = new lil.GUI();
    controls = {
        gravity: gravity,
        jumpStrength: jumpStrength,
        resetGame: resetGame,
    };

    // Añadir controles para gravedad y fuerza de salto
    gui.add(controls, 'gravity', -0.02, 0.02).name('Gravedad').onChange(updateGravity);
    gui.add(controls, 'jumpStrength', 0.01, 0.2).name('Fuerza de Salto').onChange(updateJumpStrength);
    gui.add(controls, 'resetGame').name('Reiniciar Juego');
}

// Funciones para actualizar los valores
function updateGravity(value) {
    gravity = value;
}

function updateJumpStrength(value) {
    jumpStrength = value;
}

// Llamar a la creación de la GUI
createGUI();


// Control de salto con teclado
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        velocity = jumpStrength;
    }
});


// Crear geometría para las tuberías
const pipeGeometry = new THREE.CylinderGeometry(0.4, 0.4, 10, 32);
const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

// Crear grupo para las tuberías
const pipes = [];
const pipeSpeed = 0.02;  // Velocidad del movimiento vertical de algunas tuberías

let score = 0;
let bajar = false;
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.innerHTML = `Puntuación: ${score}`;
document.body.appendChild(scoreElement);


// Crear geometría para las tuberías con bordes y huecas
function createPipeWithEdges() {
    // Geometría externa
    const outerRadius = 0.4;
    const innerRadius = 0.35; // Tubería hueca por dentro
    const height = 10;
    const segments = 12;

    // Tubería externa
    const pipeOuterGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, height, segments);

    // Tubería interna para hacerla hueca
    const pipeInnerGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, height, segments);
    
    // Invertimos la geometría interna para que su lado visible sea el interior de la tubería
    pipeInnerGeometry.scale(-1, 1, -1);

    // Borde superior
    const edgeHeight = 0.5;
    const edgeGeometryTop = new THREE.CylinderGeometry(outerRadius + 0.05, outerRadius + 0.05, edgeHeight, segments);
    
    // Borde inferior
    const edgeGeometryBottom = new THREE.CylinderGeometry(outerRadius + 0.05, outerRadius + 0.05, edgeHeight, segments);

    // Crear malla para la parte superior del borde
    const pipeEdgeTop = new THREE.Mesh(edgeGeometryTop, pipeMaterial);
    pipeEdgeTop.position.y = height / 2 + edgeHeight / 2; // Colocar en la parte superior

    // Crear malla para la parte inferior del borde
    const pipeEdgeBottom = new THREE.Mesh(edgeGeometryBottom, pipeMaterial);
    pipeEdgeBottom.position.y = -height / 2 - edgeHeight / 2; // Colocar en la parte inferior

    // Crear malla para la tubería externa
    const pipeOuter = new THREE.Mesh(pipeOuterGeometry, pipeMaterial);

    // Crear malla para la tubería interna
    const pipeInner = new THREE.Mesh(pipeInnerGeometry, pipeMaterial);

    // Crear un grupo para combinar las geometrías
    const pipeGroup = new THREE.Group();
    pipeGroup.add(pipeOuter);
    pipeGroup.add(pipeInner);
    pipeGroup.add(pipeEdgeTop);
    pipeGroup.add(pipeEdgeBottom);

    return pipeGroup;
}


// Crear geometría para las tuberías con bordes y huecas
function createPipeWithEdges2() {
    // Geometría externa
    const outerRadius = 0.4;
    const innerRadius = 0.35; // Tubería hueca por dentro
    const height = 3;
    const segments = 12;

    // Tubería externa
    const pipeOuterGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, height, segments);

    // Tubería interna para hacerla hueca
    const pipeInnerGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, height, segments);
    
    // Invertimos la geometría interna para que su lado visible sea el interior de la tubería
    pipeInnerGeometry.scale(-1, 1, -1);

    // Borde superior
    const edgeHeight = 0.5;
    const edgeGeometryTop = new THREE.CylinderGeometry(outerRadius + 0.05, outerRadius + 0.05, edgeHeight, segments);
    
    // Borde inferior
    const edgeGeometryBottom = new THREE.CylinderGeometry(outerRadius + 0.05, outerRadius + 0.05, edgeHeight, segments);

    // Crear malla para la parte superior del borde
    const pipeEdgeTop = new THREE.Mesh(edgeGeometryTop, pipeMaterial);
    pipeEdgeTop.position.y = height / 2 + edgeHeight / 2; // Colocar en la parte superior

    // Crear malla para la parte inferior del borde
    const pipeEdgeBottom = new THREE.Mesh(edgeGeometryBottom, pipeMaterial);
    pipeEdgeBottom.position.y = -height / 2 - edgeHeight / 2; // Colocar en la parte inferior

    // Crear malla para la tubería externa
    const pipeOuter = new THREE.Mesh(pipeOuterGeometry, pipeMaterial);

    // Crear malla para la tubería interna
    const pipeInner = new THREE.Mesh(pipeInnerGeometry, pipeMaterial);

    // Crear un grupo para combinar las geometrías
    const pipeGroup = new THREE.Group();
    pipeGroup.add(pipeOuter);
    pipeGroup.add(pipeInner);
    pipeGroup.add(pipeEdgeTop);
    pipeGroup.add(pipeEdgeBottom);

    return pipeGroup;
}


// Modificar el bucle para generar tuberías
for (let i = 0; i < 50; i++) {
    let pipesGroup;
    const xPos = i * 5 + 10;
    const gapHeight = Math.random() * 6 - 3;
    const isMoving = Math.random() > 0.8;  // Un 20% de probabilidad de movimiento vertical

    // Decidir si se creará una tubería normal o especial
    const isSpecialPipe = Math.random() > 0.2;  // Un 20% de probabilidad de tuberías especiales

    if (isSpecialPipe) {
        // Crear tubería especial con dos huecos
        const pipeTop = createPipeWithEdges2();
        const pipeMiddle = createPipeWithEdges2();
        const pipeBottom = createPipeWithEdges2();
     
        // Ajuste de posición de la tubería especial
        const gapHeight = Math.random() * 1 - 1;
        pipeTop.position.set(xPos,  2+gapHeight + 3, 0);     // Tubería superior
        pipeMiddle.position.set(xPos, gapHeight, 0);            // Tubería intermedia
        pipeBottom.position.set(xPos,  -2+gapHeight - 3, 0); // Tubería inferior

        // Añadir tuberías a la escena y al array
        scene.add(pipeTop);
        scene.add(pipeMiddle);
        scene.add(pipeBottom);
        pipes.push({ top: pipeTop, middle: pipeMiddle, bottom: pipeBottom, xPos: xPos, isMoving: false, passed: false });

    } else {
        // Crear tubería normal con un hueco
        const pipeTop = createPipeWithEdges();
        const pipeBottom = createPipeWithEdges();

        // Ajuste de posición de la tubería normal
        pipeTop.position.set(xPos, 6.5 + gapHeight + Math.random(), 0);
        pipeBottom.position.set(xPos, -6.5 + gapHeight + Math.random(), 0);

        // Añadir movimiento vertical si es necesario
        if (isMoving) {
            pipeTop.userData.isMoving = true;
            pipeBottom.userData.isMoving = true;
        }

        // Añadir tuberías a la escena y al array
        scene.add(pipeTop);
        scene.add(pipeBottom);
        pipes.push({ top: pipeTop, bottom: pipeBottom, xPos: xPos, isMoving: isMoving, passed: false });
    }
}


let isJumping = false;

// Rotación relacionada con el salto
let maxTilt = Math.PI/3; // Máxima inclinación hacia arriba (en radianes)
let currentTilt = 0; // Inclinación actual
let tiltSpeed = 0.01; // Velocidad a la que se inclina el pájaro

// Control de salto con teclado
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        velocity = jumpStrength;  // Asignar la fuerza del salto
        currentTilt = maxTilt;   // Inclinar el pájaro hacia arriba
        }
});

// Función para actualizar la posición y la inclinación del pájaro (con gravedad)
function updateBird() {
    //bird.rotation.y = currentTilt;


    velocity += gravity;  // Aplicar gravedad a la velocidad
    bird.position.y += velocity;  // Actualizar la posición Y del pájaro

    // volver a la inclinación neutral o hacia abajo
    if (velocity <= 0) {
        currentTilt = 0
    }

    // Limitar la posición del pájaro para que no salga de los límites
    if (bird.position.y > 5) {
        bird.position.y = 5;
        velocity = 0;
    }
    if (bird.position.y < -3) {
        bird.position.y = -3;
        velocity = 0;
    }
}



// Función para mover las tuberías
function updatePipes() {
    pipes.forEach(pipe => {
        // Movimiento horizontal
        pipe.top.position.x -= 0.05;
        pipe.bottom.position.x -= 0.05;
        if (pipe.middle) {
            pipe.middle.position.x -= 0.05; // Mover también la tubería intermedia si existe
        }

        // Inicializar la propiedad 'bajar' para cada tubería si no existe
        if (pipe.bajar === undefined) {
            pipe.bajar = false;  // Empezar subiendo
        }

        if (pipe.isMoving) {
            let moveSpeed;  

            // Verifica si la tubería debe moverse hacia arriba o hacia abajo
            if (!pipe.bajar) {
                moveSpeed = 0.02;  // Mover hacia arriba
            } else {
                moveSpeed = -0.02;  // Mover hacia abajo
            }
        
            // Aplicar el movimiento vertical a las tuberías
            pipe.top.position.y += moveSpeed;
            pipe.bottom.position.y += moveSpeed;
            if (pipe.middle) {
                pipe.middle.position.y += moveSpeed; // Mover también la tubería intermedia
            }
            
            // Cambiar dirección cuando llegue al límite inferior o superior
            if (pipe.bottom.position.y >= -2) {
                pipe.bajar = true;  // Cambiar dirección para bajar
            }
            if (pipe.bottom.position.y <= -8) {
                pipe.bajar = false;   // Cambiar dirección para subir
            }
        }
    
        // Contabilizar si el pájaro pasa una tubería (top para cualquier tipo)
        if (!pipe.passed && pipe.top.position.x < bird.position.x) {
            pipe.passed = true;
            score += 1;
            scoreElement.innerHTML = `Puntuación: ${score}`;
        }
    });
}



// Función de colisiones
function checkCollisions() {
    const birdBox = new THREE.Box3().setFromObject(bird);

    for (const pipe of pipes) {
        const topBox = new THREE.Box3().setFromObject(pipe.top);
        const bottomBox = new THREE.Box3().setFromObject(pipe.bottom);

        if (birdBox.intersectsBox(topBox) || birdBox.intersectsBox(bottomBox)) {
            // Si colisiona, se reinicia el juego
            alert('¡Colisión! Has perdido.');
            resetGame();
        }
    }
}

function resetGame() {
    bird.position.set(0, 1, 0);
    velocity = 0;
    score = 0;
    scoreElement.innerHTML = `Puntuación: ${score}`;
}

// Cambio entre primera y tercera persona
let inFirstPerson = false;
window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyC') {
        inFirstPerson = !inFirstPerson;

        if (inFirstPerson) {
            // Colocamos la cámara justo en la posición del pájaro
            camera.position.set(bird.position.x - 2, bird.position.y, bird.position.z+1);
            
            // Miramos hacia adelante en el eje X
            camera.lookAt(bird.position); // +1 en el eje X para mirar hacia adelante
        } else {
            // Vista en tercera persona: cámara detrás y por encima del pájaro
            camera.position.set(0, 1, 5); // Vista desde 3ª persona
            camera.lookAt(0, 1, 5);
 
        }
    }
});



// Crear un array para almacenar las monedas
const coins = [];
const coinLoader = new THREE.GLTFLoader();

// Función para crear monedas entre las tuberías
function createCoinsBetweenPipes() {
    pipes.forEach((pipe, index) => {
        // Cargar el modelo de la moneda
        coinLoader.load(
            'models/moneda.glb',
            function (gltf) {
                const coin = gltf.scene;
                coin.traverse(function (child) {
                    if (child.isMesh) {
                      // Verifica si el mesh ya tiene un material
                      if (child.material) {
                        child.material.metalness = 0.8;  // Aumenta el metalness para darle un aspecto metálico brillante
                        child.material.roughness = 0.2;  // Disminuye el roughness para hacer el material más reflectante
                        child.material.emissive = new THREE.Color(0xffff00);  // Color de emisión (brillo propio)
                        child.material.emissiveIntensity = 0.4;  // Ajusta la intensidad del brillo
                      }
                    }})
                // Posicionar la moneda en el centro entre las tuberías
          
                   // Número aleatorio entre -4 y -1
                   // Número aleatorio entre 3 y -3
                coin.position.set(pipe.xPos+Math.random() * (-1 + 4) - 4, 
                                     Math.random() * (4 + 2) - 2, 0);

                // Escalar la moneda
                coin.scale.set(0.3, 0.3, 0.3);

                // Añadir la moneda a la escena y al array de monedas
                scene.add(coin);
                coins.push({ object: coin, collected: false, pipeIndex: index });
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log(error);
            }
        );
    });
}

// Llamar a la función para crear las monedas
createCoinsBetweenPipes();

// Función para mover y rotar las monedas al ritmo de las tuberías
function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Mover la moneda junto con las tuberías
            coin.object.position.x -= 0.05;  // Mover en el eje X al mismo ritmo que las tuberías

            // Rotar la moneda sobre su eje Y
            coin.object.rotation.y += 0.05;
        }
    });
}

// Función para detectar colisiones con las monedas
function checkCoinCollisions() {
    const birdBox = new THREE.Box3().setFromObject(bird);

    coins.forEach((coin, index) => {
        if (!coin.collected) {
            const coinBox = new THREE.Box3().setFromObject(coin.object);

            // Si el pájaro choca con la moneda
            if (birdBox.intersectsBox(coinBox)) {
                // Eliminar la moneda de la escena
                scene.remove(coin.object);
                coin.collected = true;

                // Sumar 3 puntos
                score += 3;
                scoreElement.innerHTML = `Puntuación: ${score}`;
            }
        }
    });
}





// Actualización del movimiento del pájaro, tuberías y colisiones
function animate() {
    requestAnimationFrame(animate);

    updateBird();
    updatePipes();
    updateCoins();        // Rotar las monedas y actualizar
    checkCoinCollisions(); // Detectar colisiones con las monedas
    checkCollisions();

    // Actualizar cámara si está en primera persona
    if (inFirstPerson) {
        camera.position.set(bird.position.x - 2, bird.position.y, bird.position.z + 1);
        camera.lookAt(bird.position);
    } 

    renderer.render(scene, camera);

    // Renderizado del minimapa
    minimapRenderer.render(scene, minimapCamera);
}

animate();