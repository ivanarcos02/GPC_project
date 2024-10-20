
// Globales convenidas por threejs
const renderer = new THREE.WebGLRenderer();
let camera;
const scene = new THREE.Scene();
// Control de camara
let cameraControls;

// Monitor de recursos
const reloj = new THREE.Clock();
const stats = new Stats();



// Mundo fisico
let world;
const groundMaterial = new CANNON.Material("groundMaterial");
const boxMaterial = new CANNON.Material("boxMaterial");

//Podemos organizar el código encapsulando la creación y configuración de la caja física y visual 
// en una función llamada crearCaja.

function crearCaja(x,y,z,dx,dy,dz,color) {
    // Caja - Visual (Three.js)
    const boxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(dx, dy, dz), 
        new THREE.MeshPhongMaterial({color: color}) 
    );
    boxMesh.position.set(x, y, z); // Posición inicial
    boxMesh.castShadow = true;
    scene.add(boxMesh);

    // Caja - Física (Cannon.js)
    const boxShape = new CANNON.Box(new CANNON.Vec3(0.5*dx, 0.5*dy, 0.5*dz)); // La mitad de las dimensiones en Cannon
    const boxBody = new CANNON.Body({ mass: 1, material: boxMaterial });
    boxBody.addShape(boxShape);
    boxBody.position.set(boxMesh.position.x, boxMesh.position.y, boxMesh.position.z); // Sincronizar posición inicial
    world.addBody(boxBody);

    // Relación física-visual
    boxMesh.body = boxBody;

    return boxMesh;
}

createWorld();
render();


function createWorld() {
    // Mundo Fisico
    world = new CANNON.World(); 
    world.gravity.set(0, -9.8, 0); 

    // Suelo
    // visual
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(30, 2, 1, 1), new THREE.MeshPhongMaterial());
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -0.0001;
    suelo.receiveShadow = true;
    scene.add(suelo);

    // fisico
    const groundShape = new CANNON.Plane();
    const ground = new CANNON.Body({ mass: 0, material: groundMaterial });
    ground.addShape(groundShape);
    ground.position.y = -0.0001;
    ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(ground);
    suelo.body = ground;

    const boxGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial, boxMaterial, {
        friction: 0.4, 
        restitution: 0.9
    });
    world.addContactMaterial(boxGroundContactMaterial);    


    // Pilar izquierdo (nivel inferior) (a)
    crearCaja(4, 0.5, 0, 0.5, 1, 0.5, 0x654321);  // x, y, z, dx, dy, dz, color

    // Pilar derecho (nivel inferior) (b)
    crearCaja(6, 0.5, 0, 0.5, 1, 0.5, 0x654321);

    // Techo (nivel superior) (f)
    crearCaja(5, 2.5, 0, 3.5, 0.25, 0.5, 0xFFFF00); 

    // Cubo (g)
    crearCaja(5, 3, 0, 0.75, 0.75, 0.75, 0xFF00FF); 


   // Semicírculo
const geometrySemicircle = new THREE.SphereGeometry(0.7, 32, 10,10);  // Radio 1, 32 segmentos, ángulo inicial π (180 grados)
const materialSemicircle = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const semicircle = new THREE.Mesh(geometrySemicircle, materialSemicircle);
semicircle.position.set(0, 0.5, 0);  // Colocamos el semicírculo

// Rectángulo
const geometryRectangle = new THREE.BoxGeometry(2, 0.5, 0.1);  // Rectángulo con ancho 2 y altura 1
const materialRectangle = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const rectangle = new THREE.Mesh(geometryRectangle, materialRectangle);
rectangle.position.set(1,0.8, 0);  // Colocar el rectángulo debajo del semicírculo

// Agrupar semicírculo y rectángulo
const group = new THREE.Group();
group.add(semicircle);
group.add(rectangle);
group.position.set(-10, -0.2, 0);  // Posiciona el grupo en la escena

// Añadir el grupo a la escena
scene.add(group);

    // Inicializar el motor de render
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x000000));
    document.getElementById('container').appendChild(renderer.domElement);

    // Reloj
    reloj.start();

    // Crear y situar la camara
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
    camera.position.set(2, 5, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Control de camara
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    stats.showPanel(0);
    document.getElementById('container').appendChild(stats.domElement);

    // Callbacks
    window.addEventListener('resize', updateAspectRatio);

    scene.add(new THREE.AxesHelper(5));

    const light1 = new THREE.SpotLight(0xffffff, 0.5);
    light1.position.set(0, 30, 15);
    light1.angle = Math.PI / 4;
    light1.penumbra = 0.5;
    light1.castShadow = true;
    light1.shadow.mapSize.width = 1024;
    light1.shadow.mapSize.height = 1024;
    light1.shadow.camera.near = 0.5;
    light1.shadow.camera.far = 20;
    scene.add(light1);

    const light2 = new THREE.SpotLight(0xffffff, 0.5);
    light2.position.set(-25, 25, 25);
    light2.angle = Math.PI / 4;
    light2.penumbra = 0.5;
    light2.castShadow = true;
    light2.shadow.mapSize.width = 1024;
    light2.shadow.mapSize.height = 1024;
    light2.shadow.camera.near = 0.5;
    light2.shadow.camera.far = 20;
    scene.add(light2);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/**
 * Isotropía frente a redimension del canvas
 */
function updateAspectRatio()
{
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

/**
 * Actualizacion segun pasa el tiempo
 */
function update()
{
	const segundos = reloj.getDelta();	// tiempo en segundos que ha pasado por si hace falte
    world.step(segundos);

    // Sincronizar el mesh visual con el cuerpo físico
    // Recorre todos los objetos en la escena
    scene.traverse(function(obj) {
        // Verifica si el objeto tiene una propiedad `body` (CANNON.Body)
        if (obj.body !== undefined) {
            // Sincroniza la posición y rotación del objeto visual con el cuerpo físico
            obj.position.copy(obj.body.position);
            obj.quaternion.copy(obj.body.quaternion);
        }
    });

	// Actualiza el monitor 
	stats.update();
}

/**
 * Update & render
 */
function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}

