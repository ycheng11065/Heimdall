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
        
        this.position.set(...CAMERA.INITIAL_POSITION);
        
        this.controls = new OrbitControls(this, renderer.domElement);
        this.controls.enableDamping = CAMERA.CONTROLS.DAMPING;
        this.controls.dampingFactor = CAMERA.CONTROLS.DAMPING_FACTOR;
        this.controls.minDistance = CAMERA.CONTROLS.MIN_DISTANCE;
        this.controls.maxDistance = CAMERA.CONTROLS.MAX_DISTANCE;
        this.controls.minPolarAngle = CAMERA.CONTROLS.MIN_POLAR_ANGLE;
        this.controls.maxPolarAngle = CAMERA.CONTROLS.MAX_POLAR_ANGLE;
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