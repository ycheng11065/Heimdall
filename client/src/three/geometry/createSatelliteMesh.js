// src/three/helper/satellite.js
import * as THREE from 'three';
import { GLOBE } from '../constants.js';

export function createSatelliteMesh(satelliteDTO, positionKm, color = 0xff0000) {
	const scale = GLOBE.RADIUS / 6371;

	const geometry = new THREE.SphereGeometry(0.1, 8, 8);
	const material = new THREE.MeshBasicMaterial({ color });
	const mesh = new THREE.Mesh(geometry, material);

	mesh.position.set(
		positionKm[0] * scale,
		positionKm[1] * scale,
		positionKm[2] * scale
	);

	// console.log(satelliteDTO.noradCatId);

	mesh.userData = {
		noradCatId: satelliteDTO.noradCatId,
        objectName: satelliteDTO.objectName,
        countryCode: satelliteDTO.countryCode,
        launchDate: satelliteDTO.launchDate,
        decayDate: satelliteDTO.decayDate,
        lastUpdated: satelliteDTO.lastUpdated,
        epoch: satelliteDTO.epoch,
        tleLine1: satelliteDTO.tleLine1,
        tleLine2: satelliteDTO.tleLine2,
		x: positionKm[0] * scale,
		y: positionKm[1] * scale,
		z: positionKm[2] * scale
	}

	return mesh;
}
