import * as UTILS from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";

// Improved rendering for continent-sized polygons using stereographic projection
export const generateGeoPolygonMeshes = (data, geoFeature) => {
    const features = data.features;

    let meshes = [];
    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const shape = UTILS.generateSphericalPolygonGeometry(feature);
            
            let color = 0xFFFFFF;
            let name = "Unknown";
            let opacity = 1.0;

            switch (geoFeature) {
                case GEO_FEATURE.LAKES:
                    color = 0x00FFFF;
                    name = "Lake";
                break;

                case GEO_FEATURE.LAND:
                    color = 0x00FF00;
                    name = "Land";
                break;
            }

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(shape, material);
            mesh.name = name;
            
            meshes.push(mesh);
        }
    });

    return meshes;
}

export const generateShapeIndices = (shape) => {
    const vertices = shape.attributes.position.array;
                    
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

    let indices = [];
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        
        const dotGeometry = new THREE.SphereGeometry(GLOBE.RADIUS * 0.002, 8, 8);
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        dot.position.set(x, y, z);
        
        indices.push(dot);
    }

    return indices;
}
  
