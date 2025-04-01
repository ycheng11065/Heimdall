import { llToVector3 } from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";
import earcut from "earcut";

export const renderGeoLines = (data, scene, geoFeature) => {
    const features = data.features;

    features.forEach(feature => {
        if (feature.geometry.type === "LineString") {
            const points = [];

            feature.geometry.coordinates.forEach(coord => {
                const [longitude, latitude] = coord;
                const point = llToVector3(latitude, longitude, GLOBE.RADIUS + 0.001); // .001 to be slightly above globe
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

export const renderGeoPolygons = (data, scene, geoFeature) => {
    const features = data.features;
    
    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const positions = [];
            const flatPositions = [];
            
            feature.geometry.coordinates[0].forEach(coord => {
                const [longitude, latitude] = coord;
                const point = llToVector3(latitude, longitude, 1.002); 
                positions.push(point);
                flatPositions.push(point.x, point.y, point.z);
            });
            
            
            const vertices = [];
            const holeIndices = [];
            
            const projectedPoints = THREE.projectToPlane(positions);
            
            projectedPoints.forEach(pt => {
                vertices.push(pt.x, pt.y);
            });
            
            const indices = earcut(vertices, holeIndices);
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatPositions, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();

            let colour;
            switch (geoFeature) {
                case GEO_FEATURE.OCEANS:
                    colour = 0x0000FF;
                    break;
                case GEO_FEATURE.LAKES:
                    colour = 0x00FFFF;
                    break;
                case GEO_FEATURE.LAND:
                    colour = 0x00FF00;
                    break;
                default:
                    colour = 0xFFFFFF;
            }
            
            const material = new THREE.MeshBasicMaterial({
                color: colour,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }
    });
}