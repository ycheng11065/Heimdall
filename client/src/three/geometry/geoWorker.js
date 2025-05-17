import { generateGeoPolygonMeshes } from './globeGeoRenderers.js';
import { GEOWORKER_COMMANDS } from '../constants.js';
import initWasm from '../../wasm/spherekit/pkg/spherekit.js';

// TODO: transferables for optimization. 

const serializeMesh = (mesh) => {
    const geometry = mesh.geometry;
    const material = mesh.material;

    return {
        name: mesh.name,
        geometry: {
            positionArray: geometry.attributes.position.array,
            indexArray: geometry.index.array,
        },
        material: {
            color: material.color.getHex(),
            transparent: material.transparent,
            opacity: material.opacity,
            side: material.side,
        },
    };
};

let wasmInitialized = false;
let wasmInitPromise = null;

const ensureWasmInitialized = async () => {
    if (!wasmInitialized) {
        if (!wasmInitPromise) {

            wasmInitPromise = initWasm().then(() => {
                wasmInitialized = true;
            }).catch(err => {
                console.error('Failed to initialize WASM module:', err);
                throw err;
            });
        }
        await wasmInitPromise;
    }

    return wasmInitialized;
};

self.onmessage = async function (e) {
    try {
        await ensureWasmInitialized();
    } catch (e) {
        console.error('WASM initialization failed:', e);
        self.postMessage({ error: 'WASM initialization failed' });
        return;
    }

    const { command, data } = e.data;

    if (command === GEOWORKER_COMMANDS.GEN_MESH) {
        const meshes = generateGeoPolygonMeshes(data.geojson, data.geoFeature);
        const serializedMeshes = meshes.map(serializeMesh);
        self.postMessage({ meshes: serializedMeshes });
    }
}