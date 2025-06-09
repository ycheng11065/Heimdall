// src/three/helper/satellite.js
import * as THREE from 'three';
import { GLOBE, EARTH } from '../constants.js';

export function createSatelliteMesh(satelliteDTO, position, latitude, longitude, altitude, color = 0xff0000) {
	// const scale = GLOBE.RADIUS / EARTH.MEAN_RADIUS;
	const scale = 1 / EARTH.MEAN_RADIUS;


	const geometry = new THREE.SphereGeometry(0.1, 8, 8);
	const material = new THREE.MeshBasicMaterial({ color });
	const mesh = new THREE.Mesh(geometry, material);

	setSatellitePosition(mesh, position, satelliteDTO, latitude, longitude, altitude);

	// setSatellitePosition(mesh, [
	// 	position[0] * scale,
	// 	position[1] * scale,
	// 	position[2] * scale
	// ]);

	return mesh;
}

export function setSatellitePosition(mesh, position, satelliteDTO, latitude, longitude, altitude) {
	const scale = GLOBE.RADIUS / EARTH.MEAN_RADIUS;

	mesh.position.set(
		position[0] * scale,
		position[1] * scale,
		position[2] * scale
	);

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
		x: position[0],
		y: position[1],
		z: position[2],
		latitude: latitude,
		longitude: longitude,
		altitude: altitude 
	}
}
