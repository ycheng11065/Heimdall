import { Vector3, Quaternion, Matrix4 } from 'three';


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
