import { renderGeoPolygons } from './geometry/globeGeoRenderers.js';
import { GEO_FEATURE } from './constants.js';
import initWasm from '../wasm/spherekit/pkg/spherekit.js';
import { fetchGeoJSON } from '../api/geography.js';
import GlobeSceneManager from './scene.js';

export const setupGlobeScene = async (canvas) => {
    await initWasm(); // init wasm module

    const globeSceneManager = new GlobeSceneManager(canvas);

    fetchGeoJSON('ne_110m_land').then(geojson => {
        renderGeoPolygons(geojson, globeSceneManager.scene, GEO_FEATURE.LAND);
    }).catch(error => {
        console.error('Error processing GeoJSON:', error);
    });

    return globeSceneManager;
}
