import * as THREE from 'three';
import { GLOBE } from '../constants.js';


export const renderShapeIndices = (shape, scene) => {
    const vertices = shape.attributes.position.array;
                    
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        
        const dotGeometry = new THREE.SphereGeometry(GLOBE.RADIUS * 0.005, 8, 8);
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        dot.position.set(x, y, z);
        
        scene.add(dot);
    }
}

export const renderIndices = (indices, scene) => {
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });

    indices.forEach(index => {
        const x = index.x;
        const y = index.y;
        const z = index.z;
        
        const dotGeometry = new THREE.SphereGeometry(GLOBE.RADIUS * 0.005, 8, 8);
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        
        dot.position.set(x, y, z);
        
        scene.add(dot);
    });
}