/**
 * @fileoverview Helper utilities for properly disposing Three.js resources to prevent memory leaks.
 * @module helpers/disposal
 * @requires three
 */

/**
 * Recursively disposes of a Three.js Group and all its children.
 * Removes the group from the scene and properly disposes of all geometries and materials.
 * 
 * @param {THREE.Group|THREE.Object3D} group - The group or object to dispose
 * @returns {void}
 */
export const disposeGroup = (group) => {
	if (!group) return;
	this.scene.remove(group);
	group.traverse((object) => {
		if (object.geometry) {
			object.geometry.dispose();
		}
		if (object.material) {
			if (Array.isArray(object.material)) {
				// handle multi-material objects
				object.material.forEach(material => {
					disposeMaterial(material);
				});
			} else {
				// handle single material objects
				disposeMaterial(object.material);
			}
		}
	});
};

/**
 * Disposes of a Three.js material and all its associated textures.
 * Iterates through all properties of the material to find and dispose of texture objects.
 * 
 * @param {THREE.Material} material - The material to dispose
 * @returns {void}
 */
export const disposeMaterial = (material) => {
	for (const key in material) {
		const value = material[key];
		if (value && typeof value === 'object' && 'isTexture' in value) {
			value.dispose();
		}
	}
    
	material.dispose();
};