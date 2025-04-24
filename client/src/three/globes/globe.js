/**
 * @fileoverview Base Globe class providing core 3D sphere functionality.
 * @module Globe
 * @requires three
 */

import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
import { GLOBE } from '../constants';

/**
 * Base class for globe objects with configurable properties.
 * Handles the creation and management of a Three.js sphere mesh.
 * @class
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
		 * @private
		 */
		this.radius = radius;
		
		/**
		 * The number of segments used for the sphere geometry.
		 * @type {number}
		 * @private
		 */
		this.segments = segments;
		
		/**
		 * The material applied to the globe mesh.
		 * @type {MeshBasicMaterial}
		 * @private
		 */
		this.material = this._createMaterial();
		
		/**
		 * The geometry of the globe.
		 * @type {SphereGeometry}
		 * @private
		 */
		this.geometry = this._createGeometry();
		
		/**
		 * The 3D mesh representing the globe.
		 * @type {Mesh}
		 * @private
		 */
		this.mesh = this._createMesh();
	}
	
	/**
	 * Creates the sphere geometry for the globe.
	 * @returns {SphereGeometry} The created sphere geometry.
	 * @private
	 */
	_createGeometry() {
		const geometry = new SphereGeometry(this.radius, this.segments, this.segments);
		return geometry;
	}
	
	/**
	 * Creates the mesh from the geometry and material.
	 * @returns {Mesh} The created mesh.
	 * @private
	 */
	_createMesh() {
		const mesh = new Mesh(this.geometry, this.material);
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
			wireframe: GLOBE.WIREFRAME,
			transparent: GLOBE.TRANSPARENT,
			opacity: GLOBE.OPACITY,
		});
		return material;
	}
	
	/**
	 * Sets the color of the globe.
	 * @param {string|number} color - The color to set (hex, RGB, or named color).
	 * @public
	 */
	setColor(color) {
		this.material.color.set(color);
	}
	
	/**
	 * Sets whether the globe should be rendered as wireframe.
	 * @param {boolean} wireframe - True to show wireframe, false to show solid.
	 * @public
	 */
	setWireframe(wireframe) {
		this.material.wireframe = wireframe;
	}
	
	/**
	 * Sets the opacity of the globe material.
	 * @param {number} opacity - The opacity value (0-1).
	 * @public
	 */
	setOpacity(opacity) {
		this.material.opacity = opacity;
	}
	
	/**
	 * Sets whether the globe material should have transparency enabled.
	 * @param {boolean} transparent - True to enable transparency, false to disable.
	 * @public
	 */
	setTransparent(transparent) {
		this.material.transparent = transparent;
	}
	
	/**
	 * Gets the mesh representing the globe.
	 * @returns {Mesh} The globe mesh.
	 * @public
	 */
	getMesh() {
		return this.mesh;
	}
	
	/**
	 * Gets the radius of the globe.
	 * @returns {number} The globe radius.
	 * @public
	 */
	getRadius() {
		return this.radius;
	}
	
	/**
	 * Disposes of resources to prevent memory leaks.
	 * Call this method when the globe is no longer needed.
	 * @public
	 */
	dispose() {
		this.geometry.dispose();
		this.material.dispose();
	}
}

export default Globe;