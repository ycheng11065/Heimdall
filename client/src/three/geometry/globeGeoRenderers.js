import * as UTILS from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";
import { renderShapeIndices } from "./renderHelpers.js";

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
export const renderGeoPolygons = (data, scene, geoFeature, showIndices = false) => {
    const features = data.features;

    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const shape = UTILS.generateSphericalPolygonGeometry(feature);
            
            let color;
            let opacity = 1.0;
            switch (geoFeature) {
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
                opacity: opacity,
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
  
