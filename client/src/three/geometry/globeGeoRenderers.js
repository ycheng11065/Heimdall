/**
 * @fileoverview Utilities for generating 3D meshes from geographic data.
 * Provides functions to convert GeoJSON features into Three.js meshes
 * and create visual indices for debugging polygon vertices.
 * @module geoPolygonUtils
 * @requires three
 * @requires ./utils.js
 * @requires ../constants.js
 */
import * as UTILS from "./utils.js";
import { GEO_FEATURE, GLOBE } from "../constants.js";
import * as THREE from "three";

/**
 * Generates Three.js meshes from GeoJSON polygon features using stereographic projection.
 * Creates colored meshes for different geographic features like land masses and lakes.
 * 
 * @param {Object} data - GeoJSON data containing features
 * @param {GEO_FEATURE} geoFeature - Type of geographic feature (e.g., LAND, LAKES)
 * @returns {Array<THREE.Mesh>} Array of Three.js meshes representing the geographic features
 * 
 * @example
 * // Generate meshes for land masses
 * const landMeshes = generateGeoPolygonMeshes(landData, GEO_FEATURE.LAND);
 * 
 * @example
 * // Generate meshes for lakes
 * const lakeMeshes = generateGeoPolygonMeshes(lakeData, GEO_FEATURE.LAKES);
 */
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

/**
 * Generates small sphere meshes at each vertex of a given geometry.
 * Useful for debugging polygon shapes and visualizing vertex positions.
 * 
 * @param {THREE.BufferGeometry} shape - The geometry to generate indices for
 * @returns {Array<THREE.Mesh>} Array of small sphere meshes positioned at each vertex
 * 
 * @example
 * // Generate visual indices for a land polygon
 * const landPolygon = UTILS.generateSphericalPolygonGeometry(feature);
 * const indices = generateShapeIndices(landPolygon);
 * // Add indices to scene for debugging
 * indices.forEach(index => scene.add(index));
 */
export const generateShapeIndices = (shape) => {
	const vertices = shape.attributes.position.array;
	const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
	let indices = [];
	
	for (let i = 0; i < vertices.length; i += 3) {
		const x = vertices[i];
		const y = vertices[i + 1];
		const z = vertices[i + 2];
		
		const dotGeometry = new THREE.SphereGeometry(GLOBE.RADIUS * 0.003, 8, 8);
		const dot = new THREE.Mesh(dotGeometry, dotMaterial);
		dot.position.set(x, y, z);
		indices.push(dot);
	}
	
	return indices;
}