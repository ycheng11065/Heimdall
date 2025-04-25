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

/**
 * Manages the 3D scene containing an Earth globe, handling rendering,
 * animation, and cleanup.
 * @class
 */
class GlobeSceneManager {
	/**
	 * Creates a new GlobeSceneManager instance.
	 * @param {HTMLCanvasElement} canvas - The canvas element where the scene will be rendered.
	 */
	constructor(canvas) {
		/**
		 * The canvas element for rendering.
		 * @type {HTMLCanvasElement}
		 */
		this.canvas = canvas;

		/**
		 * The Three.js WebGL renderer.
		 * @type {THREE.WebGLRenderer|null}
		 */
		this.renderer = null;

		/**
		 * The Three.js scene.
		 * @type {THREE.Scene|null}
		 * @private
		 */
		this.scene = null;

		/**
		 * The camera controller for the scene.
		 * @type {GlobeCamera|null}
		 */
		this.camera = null;

		/**
		 * The Earth globe model.
		 * @type {Earth|null}
		 */
		this.earth = null;

		/**
		 * ID of the current animation frame request.
		 * @type {number|null}
		 */
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
		this.earth = new Earth(this.scene);
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