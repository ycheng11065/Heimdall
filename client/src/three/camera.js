/**
 * @fileoverview GlobeCamera is a custom camera class that extends THREE.PerspectiveCamera
 * with OrbitControls and additional functionality for interactive 3D globe viewing.
 * @module GlobeCamera
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA } from './constants.js';

/**
 * @class GlobeCamera
 * @extends {THREE.PerspectiveCamera}
 * @description A specialized camera setup for 3D globe visualization with orbit controls.
 * Uses pre-defined constants from constants.js for configuration, including FOV, near/far planes,
 * camera position, and control parameters.
 */
class GlobeCamera extends THREE.PerspectiveCamera {
    /**
     * Creates a new GlobeCamera instance with orbit controls.
     * Uses CAMERA constants for FOV, near/far planes, position, and control settings.
     * 
     * @param {THREE.WebGLRenderer} renderer - The renderer used for the scene.
     * @param {HTMLCanvasElement} canvas - The canvas element for calculating aspect ratio.
     * @constructor
     */
    constructor(renderer, canvas) {
        super(
            CAMERA.FOV,
            canvas.clientWidth / canvas.clientHeight,
            CAMERA.NEAR,
            CAMERA.FAR
        );

        this.eventDispatcher = new THREE.EventDispatcher();
        
        this.position.set(...CAMERA.INITIAL_POSITION);
        this.lookAt(...CAMERA.LOOK_AT);
        
        this.zoomRange = CAMERA.CONTROLS.MAX_DISTANCE - CAMERA.CONTROLS.MIN_DISTANCE;

        this.controls = new OrbitControls(this, renderer.domElement);
        this.controls.enableDamping = CAMERA.CONTROLS.DAMPING;
        this.controls.dampingFactor = CAMERA.CONTROLS.DAMPING_FACTOR;
        this.controls.minDistance = CAMERA.CONTROLS.MIN_DISTANCE;
        this.controls.maxDistance = CAMERA.CONTROLS.MAX_DISTANCE;
        this.controls.minPolarAngle = CAMERA.CONTROLS.MIN_POLAR_ANGLE;
        this.controls.maxPolarAngle = CAMERA.CONTROLS.MAX_POLAR_ANGLE;

        this.zoom = this.controls.getDistance(); // the distance from the camera to the target
        this._previousZoom = this.zoom; // the previous zoom level

        // end event for to adjust rotation and zoom at end of camera manipulation
        this.controls.addEventListener('end', this.#updateVariables.bind(this));

        this.#updateVariables();
    }

    /**
     * @private
     * @description Adjusts the rotation speed of the camera controls based on the current distance.
     * A non-linear adjustment that makes rotation slower when zoomed in (for precision)
     * and faster when zoomed out (for easier navigation).
     * This method also updates the zoom variable.
     * 
     * @returns {void}
     */
    #updateVariables() {
        // adjust the rotation speed based on the distance to the target
        const distance = this.position.distanceTo(this.controls.target);
        const minDistance = CAMERA.CONTROLS.MIN_DISTANCE;
        const currentRelativeDistance = (distance - minDistance) / this.zoomRange;
        this.controls.rotateSpeed = 0.01 + 0.5 * currentRelativeDistance;

        // update zoom variable
        this.zoom = this.controls.getDistance();

        if (this.zoom !== this._previousZoom) {
            this._previousZoom = this.zoom;

            const zoomEvent = { type: 'zoom', zoomLevel: this.zoom };
            this.eventDispatcher.dispatchEvent(zoomEvent);

            this._previousZoom = this.zoom;
        }
    }

    /**
     * Registers an event listener for camera events
     * 
     * @param {string} event - The event type to listen for (e.g. 'zoom')
     * @param {Function} callback - The callback function to execute when the event occurs
     * @returns {void}
     */
    addEventListener(event, callback) {
        this.eventDispatcher.addEventListener(event, callback);
    }

    /**
     * Removes a previously registered event listener
     * 
     * @param {string} event - The event type to remove listener from
     * @param {Function} callback - The callback function to remove
     * @returns {void}
     */
    removeEventListener(event, callback) {
        this.eventDispatcher.removeEventListener(event, callback);
    }

    /**
     * Updates the camera controls. Should be called in the animation loop.
     * Benefits from CAMERA.CONTROLS.DAMPING setting when enabled.
     * 
     * @returns {void}
     */
    update() {
        this.controls.update();
    }

    /**
     * Updates the camera's aspect ratio and projection matrix based on new dimensions.
     * Should be called when the canvas is resized.
     * 
     * @param {number} width - The new width in pixels.
     * @param {number} height - The new height in pixels.
     * @returns {void}
     */
    updateAspect(width, height) {
        this.aspect = width / height;
        this.updateProjectionMatrix();
    }

    /**
     * Cleans up resources used by this camera.
     * Should be called when the component using this camera is unmounted.
     * 
     * @returns {void}
     */
    dispose() {
        this.controls.dispose();
    }
}

export default GlobeCamera;