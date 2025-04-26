// import initWasm from '../wasm/spherekit/pkg/spherekit.js';
import GlobeSceneManager from './scene.js';

export const setupGlobeScene = async (canvas) => {
    // await initWasm(); // init wasm module
    
    const globeSceneManager = new GlobeSceneManager(canvas);

    return globeSceneManager;
}
