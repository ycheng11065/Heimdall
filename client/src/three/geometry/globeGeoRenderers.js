import * as UTILS from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";
import { renderShapeIndices } from "./renderHelpers.js";
import { geoContains } from "d3-geo";

export const renderGeoLines = (data, scene, geoFeature) => {
    const features = data.features;
    
    features.forEach(feature => {
        if (feature.geometry.type === "LineString") {
            const points = [];

            feature.geometry.coordinates.forEach(coord => {
                const [longitude, latitude] = coord;
                const point = UTILS.llToVector3(latitude, longitude, GLOBE.RADIUS); // .001 to be slightly above globe
                points.push(point);
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            let colour;
            switch (geoFeature) {
                case GEO_FEATURE.COASTLINE:
                    colour = 0xFFFFFF;
                    break;
                case GEO_FEATURE.RIVERS:
                    colour = 0x0000FF;
                    break;
                default:
                    colour = 0xFF0000;
            }

            const material = new THREE.LineBasicMaterial({ 
                color: colour,
                linewidth: 1
            });

            const line = new THREE.Line(geometry, material);
            scene.add(line);
        }
    });
}

// Improved rendering for continent-sized polygons using stereographic projection
export const renderGeoPolygons = (data, scene, geoFeature, showIndices = true) => {
    const features = data.features;
    const fibonacciSpherePoints = UTILS.generateFibonacciSpherePoints(4000, GLOBE.RADIUS);

    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const coordinates = feature.geometry.coordinates[0];

            // Create a triangulated spherical polygon using the Red Blob Games approach
            const shape = createSphericalPolygon(coordinates, fibonacciSpherePoints, feature);

            let color;
            switch (geoFeature) {
                case GEO_FEATURE.OCEANS:
                    color = 0x0077be; // Deeper blue for oceans
                break;
                case GEO_FEATURE.LAKES:
                    color = 0x00FFFF;
                break;
                case GEO_FEATURE.LAND:
                    color = 0x00FF00;
                break;
                default:
                    color = 0xFFFFFF;
            }

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(shape, material);
            scene.add(mesh);

            // Draw red dots at each coordinate point if showIndices is true
            if (showIndices) {
                renderShapeIndices(shape, scene);
            }
        }
    });
};
  
// Create a properly triangulated spherical polygon using the Red Blob Games approach
function createSphericalPolygon(coordinates, fibonacciSpherePoints, feature, /*subdivisions = 0*/) {
    const vectors = [];
    coordinates.forEach(coord => {
        const [longitude, latitude] = coord;
        const point = UTILS.llToVector3(longitude, latitude, GLOBE.RADIUS); // .01 to be slightly above globe
        vectors.push(new THREE.Vector3(point.x, point.y, point.z));
    });

    let containedCount = 0;
    for (let i = 0; i < fibonacciSpherePoints.length; i++) {
        const point = fibonacciSpherePoints[i];
        const v = new THREE.Vector3(point.x, point.y, point.z);
        const ll = UTILS.vector3ToLL(v);
        const contained = geoContains(feature, ll);
        if (contained) {
            containedCount++;
            vectors.push(v);
        }
    }
    console.log(`Points contained in polygon: ${containedCount}`);

    // if (subdivisions > 0) {
    //     const subdividedVectors = [];
        
    //     for (let i = 0; i < vectors.length; i++) {
    //         const v1 = vectors[i];
    //         const v2 = vectors[(i + 1) % vectors.length];

    //         subdividedVectors.push(v1.clone());

    //         // Add points along the great circle path
    //         for (let j = 1; j <= subdivisions; j++) {
    //             const t = j / (subdivisions + 1);

    //             // Spherical linear interpolation (SLERP) to follow great circle
    //             const interpolated = new THREE.Vector3().copy(v1).lerp(v2, t);
    //             // Project back to sphere surface
    //             interpolated.normalize().multiplyScalar(GLOBE.Z_CORRECTED_RADIUS);

    //             subdividedVectors.push(interpolated);
    //         }
    //     }
        
    //     vectors.length = 0;
    //     vectors.push(...subdividedVectors);
    // }

    

    const pointsArray = new Float32Array(vectors.length * 3);
    vectors.forEach((v, i) => {
        pointsArray[i * 3] = v.x;
        pointsArray[i * 3 + 1] = v.y;
        pointsArray[i * 3 + 2] = v.z;
    });

    const oppositePoint = UTILS.findOppositePoint(pointsArray);
    const rotatedPoints = UTILS.rotatePointsForProjection(pointsArray, oppositePoint);
    const stereographicPoints = UTILS.stereographicProjection(rotatedPoints);
    const { indices } = UTILS.triangulate2DPoints(stereographicPoints);

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsArray, 3));
    geometry.computeVertexNormals();

    return geometry;
}