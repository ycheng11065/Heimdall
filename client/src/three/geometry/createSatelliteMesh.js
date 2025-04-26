// src/three/helper/satellite.js
import * as THREE from 'three';
import { GLOBE } from '../constants.js';

export function createSatelliteMesh(positionKm, color = 0xff0000) {
	const scale = GLOBE.RADIUS / 6371;

	const geometry = new THREE.SphereGeometry(0.02, 8, 8);
	const material = new THREE.MeshBasicMaterial({ color });
	const mesh = new THREE.Mesh(geometry, material);

	mesh.position.set(
		positionKm[0] * scale,
		positionKm[1] * scale,
		positionKm[2] * scale
	);

	return mesh;
}
