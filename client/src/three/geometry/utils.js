import { Vector3, Vector2 } from 'three';

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
export const llToVector3 = (lat, lon, radius) => {

    // convert latitude and longitude to radians
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);


    // calculate the x, y, z coordinates
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);


    return new Vector3(x, y, z);
}

/**
 * Projects an array of 3D points onto a 2D plane.
 * The plane is determined by fitting to the provided points, with the normal 
 * pointing towards the center of the points.
 * 
 * @param {Array<THREE.Vector3>} points - Array of 3D vectors to project.
 * @returns {Array<THREE.Vector2>} Array of 2D vectors representing the projected points.
 * @throws {Error} If there's an error during projection.
 * 
 * @example
 * // Project an array of 3D points onto a 2D plane
 * const points3D = [new THREE.Vector3(1, 2, 3), new THREE.Vector3(4, 5, 6), new THREE.Vector3(7, 8, 9)];
 * const points2D = projectToPlane(points3D);
 */
export const projectToPlane = (points) => {
    if (points.length < 3) {
        console.warn('Not enough points to project to a plane');
        return [];
    }

    try {
        // calculate origin and normal of the plane
        const center = new Vector3();
        points.forEach(p => center.add(p));
        center.divideScalar(points.length);
        const normal = center.clone().normalize();
        
        // find two orthogonal vectors in the plane which are orthogonal to the normal
        // make sure the normal is not parallel a coordinate axis
        const tempVec = new Vector3(1, 0, 0);
        if (Math.abs(normal.dot(tempVec)) > 0.9) {
            tempVec.set(0, 1, 0);
        }

        // cross the normal with the temp vector to get one axis
        // then cross the normal with that axis to get the other axis
        const xAxis = new Vector3().crossVectors(normal, tempVec).normalize();
        const yAxis = new Vector3().crossVectors(normal, xAxis).normalize();

        // project points onto the plane
        return points.map(p => {
            const relativePoint = p.clone().sub(center); // translate to new origin
            return new Vector2(
                relativePoint.dot(xAxis), // project onto x-axis
                relativePoint.dot(yAxis)  // project onto y-axis
            );
        });
    } catch (error) {
        console.error('Error in projectToPlane:', error);
        return [];
    }
}