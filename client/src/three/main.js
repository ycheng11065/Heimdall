import * as THREE from 'three';
import GlobeCamera from './camera.js';
import earthTexture from '../assets/earth.jpg';

export const main = (canvas) => {
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new GlobeCamera(renderer, canvas);

    const onWindowResize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        renderer.setSize(width, height, false);
        camera.updateAspect(width, height);
    }

    window.addEventListener('resize', onWindowResize);

    const textureLoader = new THREE.TextureLoader();

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        map: textureLoader.load(earthTexture),
    });
    const earth = new THREE.Mesh(geometry, material);

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    scene.add(earth);

    renderer.render(scene, camera);

    function render(time) {
        time *= 0.001; // convert time to seconds

        renderer.render(scene, camera);
        camera.update();

        animationFrameId = requestAnimationFrame(render);
    }

    let animationFrameId = requestAnimationFrame(render);

    return () => {
        window.removeEventListener('resize', onWindowResize);
        cancelAnimationFrame(animationFrameId);
        camera.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
}