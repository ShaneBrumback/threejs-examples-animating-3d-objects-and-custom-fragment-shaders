// Set up Three.js scene
const scene = new THREE.Scene();
{
    const near = 5;
    const far = 10;
    const color = 'black';
    const density = 0.03;
    scene.fog = new THREE.FogExp2(color, density);
    scene.background = new THREE.Color(color);
}

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.z = 5;

// Set up the renderer
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.setClearColor(0x000000, 1);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.zIndex = '-3';
renderer.domElement.style.left = '0';
renderer.domElement.style.top = '0';
document.body.appendChild(renderer.domElement);

// Create the gradient shader material
var shaderGradientAnimatedMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;

        void main() {
            vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), sin(time));
            gl_FragColor = vec4(color, 1.0);
        }
    `
});

// Set up the orbital controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.dampingFactor = 0.1;
controls.autoRotate = true;

// Create and add the spheres to the scene
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
for (let i = 0; i < 100; i++) {
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = Math.random() * 10 - 5;
    sphere.position.y = Math.random() * 10 - 5;
    sphere.position.z = Math.random() * 10 - 5;
    sphere.velocity = new THREE.Vector3(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1);
    scene.add(sphere);
}

// Create the spotlight with shadows
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(10, 20, 30);
spotLight.castShadow = true;
scene.add(spotLight);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Enable shadows on the spheres
scene.traverse(function (node) {
    if (node instanceof THREE.Mesh) {
        node.castShadow = true;
    }
});

// Create the plane's geometry
const planeGeometry = new THREE.PlaneGeometry(100, 100);
// Create a material to apply to the plane
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 'blue',
    side: THREE.DoubleSide,
    depthWrite: false
});
// Create the plane
const plane = new THREE.Mesh(planeGeometry, shaderGradientAnimatedMaterial);
plane.rotation.x = Math.PI / 2;
plane.rotation.z = Math.PI;
plane.position.y = -6;
plane.receiveShadow = true;
plane.castShadow = true;
// Add the plane to the scene
scene.add(plane);

// Add a grid helper
var grid = new THREE.GridHelper(100, 30);
grid.position.y = -6;
scene.add(grid);

// Animate the spheres
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // Move the spheres
    scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            let objectName = node.geometry.type;
            if (objectName === 'SphereGeometry') {
                node.position.add(node.velocity);
                // Check boundaries and change direction if necessary
                if (node.position.x < -5 || node.position.x > 5) {
                    node.velocity.x *= -1;
                }
                if (node.position.y < -5 || node.position.y > 5) {
                    node.velocity.y *= -1;
                }
                if (node.position.z < -5 || node.position.z > 5) {
                    node.velocity.z *= -1;
                }
            }
        }
    });
    shaderGradientAnimatedMaterial.uniforms.time.value += 0.05;
    renderer.render(scene, camera);
}
animate();
