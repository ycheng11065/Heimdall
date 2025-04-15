import * as UTILS from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";
import { renderShapeIndices } from "./renderHelpers.js";
import { handle_polygon_feature_wasm } from "../../wasm/spherekit/pkg/spherekit.js";

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

    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            let coordinates = handle_polygon_feature_wasm(JSON.stringify(feature));

            // Create a triangulated spherical polygon using the Red Blob Games approach
            const shape = createSphericalPolygon(coordinates);
            
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
function createSphericalPolygon(coordinates) {
    

    const scaledPositions = new Float32Array(coordinates.length * 3);


    for (let i = 0; i < coordinates.length; i++) {
        const vector = coordinates[i];
        scaledPositions[i * 3] = vector[0] * GLOBE.RADIUS;
        scaledPositions[i * 3 + 1] = vector[2] * GLOBE.RADIUS;
        scaledPositions[i * 3 + 2] = -vector[1] * GLOBE.RADIUS;
    }
    

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(scaledPositions, 3));

    return geometry;
}