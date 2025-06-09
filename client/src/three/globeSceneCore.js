import initWasm from '../wasm/spherekit/pkg/spherekit.js';
import GlobeSceneManager from './scene.js';

export const setupGlobeScene = async (canvas, reactSetSelectedSatellite) => {
    await initWasm(); // init wasm module
    
    const globeSceneManager = new GlobeSceneManager(canvas, reactSetSelectedSatellite);

    return globeSceneManager;
}
