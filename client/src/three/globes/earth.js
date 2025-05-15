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
import { fetchGeoJSON } from "../../api/geography";
import { GEO_FEATURE } from "../constants";
import { generateGeoPolygonMeshes, generateShapeIndices } from "../geometry/globeGeoRenderers";
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
	constructor(scene) {
		super();

		/**
		 * The Three.js scene where the Earth is rendered
		 * @type {THREE.Scene}
		 */
		this.scene = scene;

		/**
		 * Group containing all land mass meshes
		 * @type {THREE.Group}
		 */
		this.landMeshes = new THREE.Group();

		/**
		 * Group containing all lake meshes
		 * @type {THREE.Group}
		 */
		this.lakeMeshes = new THREE.Group();

		/**
		 * Group containing debug indices for land vertices
		 * @type {THREE.Group}
		 */
		this.landIndices = new THREE.Group();

		/**
		 * Group containing debug indices for lake vertices
		 * @type {THREE.Group}
		 */
		this.lakeIndices = new THREE.Group();

		this._init();
	}

	/**
	 * Initializes the Earth model with base globe, land masses, and lakes
	 * @private
	 */
	_init() {
		this.scene.add(this.getGlobeMesh()); // add parent globe mesh to the scene
		this._init110m(); // initialize 110m geometries
	}

	_init110m() {
		this._init110mLand();
	}

	/**
	 * Loads and initializes land mass geometries from GeoJSON data
	 * @private
	 */
	_init110mLand() {
		fetchGeoJSON('ne_110m_land').then(geojson => {
			let landGroup = generateGeoPolygonMeshes(geojson, GEO_FEATURE.LAND);
			landGroup.forEach(mesh => {
				this.landMeshes.add(mesh);
			});

			this.landMeshes.name = "LandGroup";
			this.scene.add(this.landMeshes);
		}).catch(error => {
			console.error('Error processing GeoJSON:', error);
		});
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
		
		disposeGroup(this.landMeshes);
		disposeGroup(this.landIndices);

		this.landMeshes = null;
		this.lakeMeshes = null;
		this.landIndices = null;
		this.lakeIndices = null;
	}
}

export default Earth;