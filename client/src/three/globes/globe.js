/**
 * @fileoverview Base Globe class providing core 3D sphere functionality.
 * @module Globe
 * @requires three
 * @requires ../constants
 * @requires ../helper/disposal
 */
import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
import { GLOBE, EARTH } from '../constants';
import { disposeMaterial } from '../helper/disposal.js';

/**
 * Base class for globe objects with configurable properties.
 * Handles the creation and management of a Three.js sphere mesh.
 */
class Globe {
	/**
	 * Creates a new Globe instance.
	 * @param {number} [radius=GLOBE.RADIUS] - The radius of the globe.
	 * @param {number} [segments=GLOBE.SEGMENTS] - The number of segments for the sphere geometry.
	 */
	constructor(radius = GLOBE.RADIUS, segments = GLOBE.SEGMENTS) {
		/**
		 * The radius of the globe.
		 * @type {number}
		 */
		this.radius = radius;

		/**
		 * The number of segments used for the sphere geometry.
		 * @type {number}
		 */
		this.segments = segments;

		/**
		 * The material applied to the globe mesh.
		 * @type {MeshBasicMaterial}
		 */
		this.material = this._createMaterial();

		/**
		 * The geometry of the globe.
		 * @type {SphereGeometry}
		 */
		this.geometry = this._createGeometry();

		/**
		 * The 3D mesh representing the globe.
		 * @type {Mesh}
		 */
	this.globeMesh = this._createGlobeMesh();
	}

	/**
	 * Creates the globe as an ellipsoid.
	 * @returns {SphereGeometry} The created ellipsoid geometry.
	 * @private
	 */
	_createGeometry() {
		const a = EARTH.EQUATORIAL_RADIUS;
		const b = EARTH.POLAR_RADIUS;

		const equatorialScale = GLOBE.RADIUS;
		const polarScale = b / a * GLOBE.RADIUS;

		const geometry = new SphereGeometry(1, 64, 64);
		geometry.scale(equatorialScale, polarScale, equatorialScale);

		return geometry;
	}

	/**
	 * Creates the mesh from the geometry and material.
	 * @returns {Mesh} The created mesh.
	 * @private
	 */
	_createGlobeMesh() {
		let mesh = new Mesh(this.geometry, this.material);
		mesh.name = "Globe";

		return mesh;
	}

	/**
	 * Creates the material for the globe.
	 * @returns {MeshBasicMaterial} The created material.
	 * @private
	 */
	_createMaterial() {
		const material = new MeshBasicMaterial({
			color: GLOBE.COLOR,
			transparent: true,
		});
		return material;
	}

	/**
	 * Makes the globe visible.
	 */
	showGlobe() {
		this.globeMesh.visible = true;
	}

	/**
	 * Hides the globe.
	 */
	hideGlobe() {
		this.globeMesh.visible = false;
	}

	/**
	 * Sets the opacity of the globe and enables transparency.
	 * A convenience method that sets both opacity and transparency in one call.
	 * @param {number} opacity - The opacity value (0-1).
	 */
	setGlobeOpacity(opacity) {
		this.material.opacity = opacity;
	}

	/**
	 * Sets the color of the globe.
	 * @param {string|number} color - The color to set (hex, RGB, or named color).
	 */
	setColor(color) {
		this.material.color.set(color);
	}

	/**
	 * Sets the globe to wireframe rendering mode.
	 */
	useWireframe() {
		this.material.wireframe = true;
	}

	/**
	 * Sets the globe to solid rendering mode.
	 */
	useSolid() {
		this.material.wireframe = false;
	}

	/**
	 * Sets whether the globe material should have transparency enabled.
	 * @param {boolean} transparent - True to enable transparency, false to disable.
	 */
	setTransparent(transparent) {
		this.material.transparent = transparent;
	}

	/**
	 * Gets the mesh representing the globe.
	 * @returns {Mesh} The globe mesh.
	 */
	getGlobeMesh() {
		return this.globeMesh;
	}

	/**
	 * Gets the radius of the globe.
	 * @returns {number} The globe radius.
	 */
	getRadius() {
		return this.radius;
	}

	/**
	 * Disposes of resources to prevent memory leaks.
	 * Call this method when the globe is no longer needed.
	 * @param {THREE.Scene} [scene] - Optional scene to remove the globe mesh from
	 */
	dispose(scene) {
		// remove from scene if provided
		if (scene && this.globeMesh && this.globeMesh.parent === scene) {
			scene.remove(this.globeMesh);
		}
		
		if (this.geometry) {
			this.geometry.dispose();
			this.geometry = null;
		}
		
		if (this.material) {
			disposeMaterial(this.material);
			this.material = null;
		}
		
		this.globeMesh = null;
	}
}

export default Globe;
