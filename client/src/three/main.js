import * as THREE from 'three';
import GlobeCamera from './camera.js';
import earthTexture from '../assets/earth.jpg';
import vertexShader from './shaders/vertex.vert';
import fragmentShader from './shaders/fragment.frag';

export const main = async (canvas) => {
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

    // Create a shader-based material for a sphere with a partial texture
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    const textureLoader = new THREE.TextureLoader();

    const material = new THREE.ShaderMaterial({
    uniforms: {
        textureMap: { value: textureLoader.load(earthTexture) },
        baseColor: { value: new THREE.Color(0x00aa00) } // Green color
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
    });

    // Create the sphere with the shader material
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    function render(/*time*/) {
        // time *= 0.001; // convert time to seconds

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
  