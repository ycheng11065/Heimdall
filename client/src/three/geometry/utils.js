import { Vector3, Quaternion, Matrix4 } from 'three';
import Delaunator from 'delaunator';
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

export const findOppositePoint = (points) => {
    let sumX = 0, sumY = 0, sumZ = 0;
    const numPoints = points.length / 3;

    for (let i = 0; i < numPoints; i++) {
        sumX += points[i * 3];
        sumY += points[i * 3 + 1];
        sumZ += points[i * 3 + 2];
    }

    const avgX = sumX / numPoints;
    const avgY = sumY / numPoints;
    const avgZ = sumZ / numPoints;

    const length = Math.sqrt(avgX * avgX + avgY * avgY + avgZ * avgZ);

    return {
        x: -avgX / length,
        y: -avgY / length,
        z: -avgZ / length
    };
}

export const rotatePointsForProjection = (points, oppositePoint) => {
    const fromVector = new Vector3(
        oppositePoint.x, 
        oppositePoint.y, 
        oppositePoint.z
    );
    
    const toVector = new Vector3(0, 0, -1);
    
    const quaternion = new Quaternion();
    quaternion.setFromUnitVectors(fromVector.normalize(), toVector);
    
    const rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationFromQuaternion(quaternion);
    
    const numPoints = points.length / 3;
    const rotatedPoints = new Float32Array(points.length);
    
    for (let i = 0; i < numPoints; i++) {
        const point = new Vector3(
            points[i * 3],
            points[i * 3 + 1],
            points[i * 3 + 2]
        );
      
        point.applyMatrix4(rotationMatrix);
        
        rotatedPoints[i * 3] = point.x;
        rotatedPoints[i * 3 + 1] = point.y;
        rotatedPoints[i * 3 + 2] = point.z;
    }
    
    return rotatedPoints;
}

export const stereographicProjection = (points) => {
    const numPoints = points.length / 3;
    const projectedPoints = [];

    for (let i = 0; i < numPoints; i++) {
        const x = points[i * 3];
        const y = points[i * 3 + 1];
        const z = points[i * 3 + 2];
        
        const scale = 1 / (1 + z);
        projectedPoints.push(x * scale, y * scale);
    }

    return projectedPoints;
}

export const triangulate2DPoints = (points2D) => {
    const delaunatorPoints = [];
    const numPoints = points2D.length / 2;
    
    for (let i = 0; i < numPoints; i++) {
      delaunatorPoints.push([
        points2D[i * 2],     // x coordinate
        points2D[i * 2 + 1]  // y coordinate
      ]);
    }
    
    const delaunay = new Delaunator(delaunatorPoints.flat());
    
    const indices = Array.from(delaunay.triangles);
    
    return { indices, delaunay };
}