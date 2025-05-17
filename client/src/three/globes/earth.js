/**
 * @fileoverview Earth class extends the base Globe class to provide a detailed representation of Earth
 * with land masses, lakes, and debug visualization features. It handles loading and rendering
 * of geographic data, managing visibility, and opacity control of various globe elements.
 * @module Earth
 * @requires ./globe
 * @requires ../../api/geography
 * @requires ../constants
 * @requires ../geometry/globeGeoRenderers
 * @requires three
 * @requires ../helper/disposal.js
 */
import Globe from "./globe";
import { fetchLandGeoJSON } from "../../api/geography";
import { GEO_FEATURE, GLOBE, GEOWORKER_COMMANDS } from "../constants";
import { generateShapeIndices } from "../geometry/globeGeoRenderers";
import * as THREE from "three";
import { disposeGroup } from "../helper/disposal.js";

/**
 * Extends the base Globe class to create a detailed Earth model with geographical features.
 * Manages rendering of land masses, lakes, and provides debugging visualization tools.
 * @class
 * @extends Globe
 */
class Earth extends Globe {
	/**
	 * Creates a new Earth instance with geographical features.
	 * @param {THREE.Scene} scene - The Three.js scene where the Earth will be rendered
	 */
	constructor(scene, scale = GLOBE.SCALES.S110M) {
		super();

		this.scale = scale;
		this.scene = scene;

		this.landMeshes110m = new THREE.Group();
		this.landMeshes50m = new THREE.Group();
		this.landMeshes10m = new THREE.Group();

		this.landIndices = new THREE.Group();

		this._init();
	}

	/**
	 * Initializes the Earth model with base globe, land masses, and lakes
	 * @private
	 */
	_init() {
		this.scene.add(this.getGlobeMesh()); // add parent globe mesh to the scene
		this._initLand(); 
	}

	/**
	 * Loads and initializes land mass geometries from GeoJSON data
	 * @private
	 */
	async _initLand() {

		// Load 110m land meshes
		try {
			const geojson = await fetchLandGeoJSON(this.scale);

			const geoWorker = new Worker(new URL('../geometry/geoWorker.js', import.meta.url), { type: 'module' });

			geoWorker.postMessage({
				command: GEOWORKER_COMMANDS.GEN_MESH,
				data: {
					geojson: geojson,
					geoFeature: GEO_FEATURE.LAND
				}
			});

			geoWorker.onmessage = (e) => {
				console.log("Land meshes 1:110m loaded");
				this.deserializeLandMeshes(e.data.meshes, this.landMeshes110m, true);
			}
		} catch (error) {
			console.error('Error processing GeoJSON:', error);
		}

		// Load 50m land meshes
		try {
			const geojson = await fetchLandGeoJSON(GLOBE.SCALES.S50M);
			
			const geoWorker = new Worker(new URL('../geometry/geoWorker.js', import.meta.url), { type: 'module' });

			geoWorker.postMessage({
				command: GEOWORKER_COMMANDS.GEN_MESH,
				data: {
					geojson: geojson,
					geoFeature: GEO_FEATURE.LAND
				}
			});

			geoWorker.onmessage = (e) => {
				console.log("Land meshes 1:50m loaded");
				this.deserializeLandMeshes(e.data.meshes, this.landMeshes50m, false);
			}
		} catch (error) {
			console.error('Error processing GeoJSON:', error);
		}

		// Load 10m meshes
		try {
			const geojson = await fetchLandGeoJSON(GLOBE.SCALES.S10M);
			
			const geoWorker = new Worker(new URL('../geometry/geoWorker.js', import.meta.url), { type: 'module' });
			
			geoWorker.postMessage({
				command: GEOWORKER_COMMANDS.GEN_MESH,
				data: {
					geojson: geojson,
					geoFeature: GEO_FEATURE.LAND
				}
			});

			geoWorker.onmessage = (e) => {
				console.log("Land meshes 1:10m loaded");
				this.deserializeLandMeshes(e.data.meshes, this.landMeshes10m, false);
			}
		} catch (error) {
			console.error('Error processing GeoJSON:', error);
		}
	}
	/**
	 * Sets the scale of the globe and updates visibility of land meshes
	 * @param {number} scale - The scale to set (e.g., GLOBE.SCALES.S110M, GLOBE.SCALES.S50M, GLOBE.SCALES.S10M)
	 */
	setScale(scale) {
		if (this.scale !== scale) {
			this.scale = scale;
			this.landMeshes110m.visible = scale === GLOBE.SCALES.S110M;
			this.landMeshes50m.visible = scale === GLOBE.SCALES.S50M;
			this.landMeshes10m.visible = scale === GLOBE.SCALES.S10M;
		}
	}

	/**
	 * Deserializes land meshes from the worker and adds them to the scene
	 * @param {Array} landMeshes - Array of land mesh data
	 * @param {THREE.Group} landMeshGroup - The group to which the meshes will be added
	 * @param {boolean} isVisible - Whether the land meshes should be visible
	 * @private
	 * */
	deserializeLandMeshes(landMeshes, landMeshGroup, isVisible) {
		landMeshes.forEach(mesh => {
			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.geometry.positionArray, 3));
			geometry.setIndex(new THREE.BufferAttribute(mesh.geometry.indexArray, 1));

			const material = new THREE.MeshBasicMaterial({
				color: mesh.material.color,
				transparent: mesh.material.transparent,
				opacity: mesh.material.opacity,
				side: mesh.material.side
			});

			const landMesh = new THREE.Mesh(geometry, material);
			landMesh.name = mesh.name;

			landMeshGroup.add(landMesh);
		});

		landMeshGroup.name = "LandGroup";
		landMeshGroup.visible = isVisible;

		this.scene.add(landMeshGroup);
	}

	/**
	 * Generates debug visualization for land vertices
	 * Creates sphere meshes at each vertex of land geometries
	 * @private
	 */
	_generateLandIndices() {
		this.landMeshes.children.forEach(mesh => {
			const indices = generateShapeIndices(mesh.geometry);
			indices.forEach(index => {
				this.landIndices.add(index);
			});
		});

		this.landIndices.name = "LandIndices";
		this.landIndices.visible = false;
		this.scene.add(this.landIndices);
	}

	/**
	 * Makes land masses visible
	 */
	showLand() {
		this.landMeshes.visible = true;
	}

	/**
	 * Hides land masses
	 */
	hideLand() {
		this.landMeshes.visible = false;
	}

	/**
	 * Sets the opacity of all land meshes
	 * @param {number} opacity - The opacity value (0.0-1.0)
	 */
	setLandOpacity(opacity) {
		this.landMeshes.traverse((child) => {
			if (child.isMesh) {
				child.material.opacity = opacity;
				child.material.transparent = true;
			}
		});
	}

	/**
	 * Makes land vertex indices visible
	 * Generates indices if they don't exist yet
	 */
	showLandIndices() {
		if (this.landIndices.children.length === 0) {
			this._generateLandIndices();
		}

		this.landIndices.visible = true;
	}

	/**
	 * Hides land vertex indices
	 */
	hideLandIndices() {
		this.landIndices.visible = false;
	}

	/**
	 * Disposes of all resources to prevent memory leaks
	 * Calls the parent Globe's dispose method and cleans up all groups
	 */
	dispose() {
		super.dispose(this.scene);
		
		disposeGroup(this.landMeshes110m);
		disposeGroup(this.landMeshes50m);
		disposeGroup(this.landMeshes10m);
		disposeGroup(this.landIndices);

		this.landMeshes110m = null;
		this.landMeshes50m = null;
		this.landMeshes10m = null;
		this.landIndices = null;
	}
}

export default Earth;