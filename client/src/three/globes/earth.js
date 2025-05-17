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
import { GLOBE, EARTH, GEO_FEATURE } from "../constants";
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

		this.textureContainer = new THREE.Group();
		this.scene.add(this.textureContainer);
		this._init();
	}

	/**
	 * Initializes the Earth model with base globe, land masses, and lakes
	 * @private
	 */
	_init() {
		this._addTestAxes();
		this._addTestMarkers();

		this.textureContainer.add(this.getGlobeMesh());
		this._initLand();
		this._initLakes();

		// Rotate texture clockwise to align Null Island to 0,0
		this.textureContainer.rotation.y = -Math.PI / 2;
	}

	/**
	 * Loads and initializes land mass geometries from GeoJSON data
	 * @private
	 */
	_initLand() {
		fetchGeoJSON('ne_110m_land').then(geojson => {
			let landGroup = generateGeoPolygonMeshes(geojson, GEO_FEATURE.LAND);
			landGroup.forEach(mesh => {
				this.landMeshes.add(mesh);
			});

			this.landMeshes.name = "LandGroup";
			this.textureContainer.add(this.landMeshes);
		}).catch(error => {
			console.error('Error processing GeoJSON:', error);
		});
	}

	/**
	 * Loads and initializes lake geometries from GeoJSON data
	 * @private
	 */
	_initLakes() {
		fetchGeoJSON('ne_110m_lakes').then(geojson => {
			let lakesGroup = generateGeoPolygonMeshes(geojson, GEO_FEATURE.LAKES);
			lakesGroup.forEach(mesh => {
				this.lakeMeshes.add(mesh);
			});

			this.lakeMeshes.name = "LakesGroup";
			this.textureContainer.add(this.lakeMeshes);
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
		this.textureContainer.add(this.landIndices);
	}

	/**
	 * Generates debug visualization for lake vertices
	 * Creates sphere meshes at each vertex of lake geometries
	 * @private
	 */
	_generateLakeIndices() {
		this.lakeIndices = new THREE.Group();

		this.lakeMeshes.children.forEach(mesh => {
			const indices = generateShapeIndices(mesh.geometry);
			indices.forEach(index => {
				this.lakeIndices.add(index);
			});
		});

		this.lakeIndices.name = "LakeIndices";
		this.lakeIndices.visible = false;
		this.textureContainer.add(this.lakeIndices);
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
	 * Makes lakes visible
	 */
	showLakes() {
		this.lakeMeshes.visible = true;
	}

	/**
	 * Hides lakes
	 */
	hideLakes() {
		this.lakeMeshes.visible = false;
	}

	/**
	 * Sets the opacity of all lake meshes
	 * @param {number} opacity - The opacity value (0.0-1.0)
	 */
	setLakesOpacity(opacity) {
		this.lakeMeshes.traverse((child) => {
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
	 * Makes lake vertex indices visible
	 * Generates indices if they don't exist yet
	 */
	showLakeIndices() {
		if (this.lakeIndices.children.length === 0) {
			this._generateLakeIndices();
		}

		this.lakeIndices.visible = true;
	}

	/**
	 * Hides lake vertex indices
	 */
	hideLakeIndices() {
		this.lakeIndices.visible = false;
	}

	/**
	 * Disposes of all resources to prevent memory leaks
	 * Calls the parent Globe's dispose method and cleans up all groups
	 */
	dispose() {
		super.dispose(this.scene);
	
		disposeGroup(this.landMeshes);
		disposeGroup(this.lakeMeshes);
		disposeGroup(this.landIndices);
		disposeGroup(this.lakeIndices);
		
		this.landMeshes = null;
		this.lakeMeshes = null;
		this.landIndices = null;
		this.lakeIndices = null;
	}

	showDots() {
		this.dots.forEach(dot => {
			dot.visible = true;
		});
	}

	hideDots() {
		this.dots.forEach(dot => {
			dot.visible = false;
		});
	}

	_addTestMarkers() {
		const pointGeom = new THREE.SphereGeometry(GLOBE.RADIUS * 0.02, 8, 8);
		const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const positions = [
			[  0,   0],  // lat=0, lon=0
			[  0,  90],  // lat=0, lon=90E
			[ 90,   0],  // North pole
		];
		const scale = GLOBE.RADIUS/EARTH.MEAN_RADIUS;
		this.dots = [];
		
		for (const [lat, lon] of positions) {
			const φ = THREE.MathUtils.degToRad(lat);
			const λ = THREE.MathUtils.degToRad(lon);
			
			const x = EARTH.MEAN_RADIUS * Math.cos(φ) * Math.cos(λ);
			const y = EARTH.MEAN_RADIUS * Math.cos(φ) * Math.sin(λ);
			const z = EARTH.MEAN_RADIUS * Math.sin(φ);
		
			const dot = new THREE.Mesh(pointGeom, yellowMat);
			dot.position.set(
			x * scale,
			y * scale,
			z * scale
			);

			dot.visible = false;
			this.scene.add(dot);
			this.dots.push(dot);
		}
	}

	showAxes() {
		this.arrowX.visible = true;
		this.arrowY.visible = true;
		this.arrowZ.visible = true;
	}

	hideAxes() {
		this.arrowX.visible = false;
		this.arrowY.visible = false;
		this.arrowZ.visible = false;
	}

	_addTestAxes() {
		const len = GLOBE.RADIUS * 1.2;
		this.arrowX = new THREE.ArrowHelper(
			new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), len, 0xff0000
		);

		this.arrowY = new THREE.ArrowHelper(
			new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), len, 0x0000ff
		)

		this.arrowZ = new THREE.ArrowHelper(
			new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), len, 0x00ff00
		)

		this.arrowX.visible = false;
		this.arrowY.visible = false;
		this.arrowZ.visible = false;

		this.scene.add(this.arrowX);
		this.scene.add(this.arrowY);
		this.scene.add(this.arrowZ);
	}
}

export default Earth;
