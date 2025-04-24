import { Vector3 } from 'three';
import { GLOBE } from '../constants.js';
import { generate_polygon_feature_mesh_wasm } from '../../wasm/spherekit/pkg/spherekit.js';
import * as THREE from 'three';


/**
 * Converts latitude and longitude coordinates to a 3D vector position on a sphere.
 * 
 * @param {number} lat - Latitude in degrees (-90 to 90).
 * @param {number} lon - Longitude in degrees (-180 to 180).
 * @param {number} radius - Radius of the sphere.
 * @returns {THREE.Vector3} A 3D vector representing the position on the sphere.
 * 
 * @example
 * // Convert coordinates to 3D position on a sphere with radius 10
 * const position = llToVector3(40.7128, -74.0060, 10);
 */
export const llToVector3 = (lon, lat, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);


    return new Vector3(x, y, z);
}

/**
 * Creates a Three.js BufferGeometry for a spherical polygon from GeoJSON feature data.
 * 
 * This function uses WebAssembly to generate mesh data for a spherical polygon representation
 * of geographic features. It converts the generated vertices to the correct coordinate system
 * and scale for globe rendering.
 * 
 * The WASM module must be initialized before calling this function.
 * 
 * @param {Object} feature - A GeoJSON feature object containing polygon geometry
 * @returns {THREE.BufferGeometry} A Three.js geometry representing the spherical polygon
 * @throws {Error} If the WASM module is not initialized or if polygon generation fails
 * 
 * @example
 * // After WASM initialization
 * const landFeature = geojson.features[0];
 * const geometry = getSphericalPolygonGeometry(landFeature);
 * const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
 * const mesh = new THREE.Mesh(geometry, material);
 * scene.add(mesh);
 */
export const generateSphericalPolygonGeometry = (feature) => {
    if (typeof generate_polygon_feature_mesh_wasm !== 'function') {
        console.error('WASM module not initialized. Call initWasm() first.');
        return new THREE.BufferGeometry(); 
    }

    let meshResults = generate_polygon_feature_mesh_wasm(JSON.stringify(feature));

    let coordinates = meshResults.vertices;
    const scaledPositions = new Float32Array(coordinates.length * 3);

    for (let i = 0; i < coordinates.length; i++) {
        const vector = coordinates[i];
        scaledPositions[i * 3] = vector[0] * GLOBE.Z_CORRECTED_RADIUS;
        scaledPositions[i * 3 + 1] = vector[2] * GLOBE.Z_CORRECTED_RADIUS;
        scaledPositions[i * 3 + 2] = -vector[1] * GLOBE.Z_CORRECTED_RADIUS;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(scaledPositions, 3));
    geometry.setIndex(meshResults.triangles);

    return geometry;
}
