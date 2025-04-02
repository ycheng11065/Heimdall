import { llToVector3, findOppositePoint, rotatePointsForProjection, stereographicProjection, triangulate2DPoints } from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";

export const renderGeoLines = (data, scene, geoFeature) => {
    const features = data.features;

    features.forEach(feature => {
        if (feature.geometry.type === "LineString") {
            const points = [];

            feature.geometry.coordinates.forEach(coord => {
                const [longitude, latitude] = coord;
                const point = llToVector3(latitude, longitude, GLOBE.RADIUS + 0.01); // .001 to be slightly above globe
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
export const renderGeoPolygons = (data, scene, geoFeature) => {
    const features = data.features;

    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const coordinates = feature.geometry.coordinates[0];

            // Create a triangulated spherical polygon using the Red Blob Games approach
            const shape = createSphericalPolygonWithStereographic(coordinates, GLOBE.RADIUS);

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
        }
    });
};
  
// Create a properly triangulated spherical polygon using the Red Blob Games approach
function createSphericalPolygonWithStereographic(coordinates, radius) {

    const points3D = [];
    coordinates.forEach(coord => {
        const [longitude, latitude] = coord;
        const point = llToVector3(latitude, longitude, radius);
        points3D.push(point.x, point.y, point.z);
    });
    
    const oppositePoint = findOppositePoint(points3D);
    
    const rotatedPoints = rotatePointsForProjection(points3D, oppositePoint);
    
    const projectedPoints = stereographicProjection(rotatedPoints);

    const triangulationResult = triangulate2DPoints(projectedPoints);
    
    const geometry = new THREE.BufferGeometry();
    
    const originalPoints = new Float32Array(points3D);
    geometry.setAttribute('position', new THREE.BufferAttribute(originalPoints, 3));
    
    geometry.setIndex(triangulationResult.indices);
    
    geometry.computeVertexNormals();
    
    return geometry;
}