import * as THREE from 'three';
import GlobeCamera from './camera.js';

export function main(canvas) {
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new GlobeCamera(renderer, canvas);

    function onWindowResize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        renderer.setSize(width, height, false);

        camera.updateAspect(width, height);
    }

    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    // Create objects for the scene
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
    const cube = new THREE.Mesh(geometry, material);

    // Add lighting
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
    scene.add(cube);

    // Initial render
    renderer.render(scene, camera);

    // Animation loop
    function render(time) {
    time *= 0.001; // convert time to seconds

    // Rotate the cube
    cube.rotation.x = time;
    cube.rotation.y = time;

    // Render the scene
    renderer.render(scene, camera);
    camera.update();

    // Continue animation
    animationFrameId = requestAnimationFrame(render);
    }

    // Start animation
    let animationFrameId = requestAnimationFrame(render);

    // Return cleanup function
    return () => {
    window.removeEventListener('resize', onWindowResize);
    cancelAnimationFrame(animationFrameId);
    camera.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    };
}