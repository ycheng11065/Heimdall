/**
 * @fileoverview Manages a Three.js scene containing an interactive Earth globe.
 * @module GlobeSceneManager
 * @requires three
 * @requires ./camera.js
 * @requires ./globes/earth.js
 */
import * as THREE from 'three';
import GlobeCamera from './camera.js';
import Earth from './globes/earth.js';
import { GLOBE } from './constants.js';

/**
 * Manages the 3D scene containing an Earth globe, handling rendering,
 * animation, and cleanup.
 * @class
 */
class GlobeSceneManager {
	constructor(canvas) {
		this.canvas = canvas;
		this.renderer = null;
		this.scene = null;
		this.camera = null;
		this.earth = null;
		this.animationFrameId = null;

		this._onWindowResize = this._onWindowResize.bind(this);
		this._render = this._render.bind(this);

		this._init();
	}

	/**
	 * Initializes the renderer, scene, camera, and adds event listeners.
	 * @private
	 */
	_init() {
		if (!this.canvas) {
			console.error('Canvas element is not provided.');
			return;
		}

		// initialize the renderer, scene, camera, and window listener
		window.addEventListener('resize', this._onWindowResize);
		this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.scene = new THREE.Scene();
		this.camera = new GlobeCamera(this.renderer, this.canvas);

		this.earth = new Earth(this.scene, GLOBE.SCALES.S110M);
	}

	/**
	 * Renders the scene and updates the camera.
	 * Called repeatedly as part of the animation loop.
	 * @private
	 */
	_render() {
		this.renderer.render(this.scene, this.camera);
		this.camera.update();
		this.animationFrameId = requestAnimationFrame(this._render);
	}

	/**
	 * Handles window resize events by updating renderer size and camera aspect.
	 * @private
	 */
	_onWindowResize() {
		const width = this.canvas.clientWidth;
		const height = this.canvas.clientHeight;
		this.renderer.setSize(width, height, false);
		this.camera.updateAspect(width, height);
	}

	/**
	 * Starts the animation loop if not already running.
	 */
	startAnimationLoop() {
		if (!this.animationFrameId) {
			this.animationFrameId = requestAnimationFrame(this._render);
			this._render();
		}
	}

	/**
	 * Stops the animation loop if it's running.
	 */
	stopAnimationLoop() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	/**
	 * Cleans up resources, stops animations, and removes event listeners.
	 * Call this method when the scene is no longer needed to prevent memory leaks.
	 */
	dispose() {
		this.stopAnimationLoop();
		cancelAnimationFrame(this.animationFrameId);
		window.removeEventListener('resize', this._onWindowResize);
		this.renderer.dispose();
		this.camera.dispose();
		this.earth.dispose();
	}
}

export default GlobeSceneManager;