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
import SatelliteManager from '../managers/satellites/satelliteManager.js';
import { GLOBE, EARTH } from '../three/constants.js';

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
	constructor(canvas, reactSetSelectedSatellite) {
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

		this.satelliteManager = null;  
        this.updateCallbacks = [];

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.currentHoveredMesh = null;

		this.selectedSatellite = null;
		this.selectedMesh = null;

		this.reactSetSelectedSatellite = reactSetSelectedSatellite;

		this.mouseDownPos = null;
		this.mouseMoved = false;

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

		this.satelliteManager = new SatelliteManager(this.scene);
		
		this.canvas.addEventListener('mousedown', (e) => {
			this.mouseDownPos = { x: e.clientX, y: e.clientY };
			this.mouseMoved = false;
		});

		this.canvas.addEventListener('mousemove', (e) => {
			if (!this.mouseDownPos) return;
			const dx = e.clientX - this.mouseDownPos.x;
			const dy = e.clientY - this.mouseDownPos.y;
			if (Math.sqrt(dx * dx + dy * dy) > 4) {
				this.mouseMoved = true;
			}
		});

		this.canvas.addEventListener('mouseup', (e) => {
			if (this.mouseMoved) {
				return;
			}
			this.selectSatellite(e);
		});
	}

	selectSatellite(event) {
		const rect = this.canvas.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1
		);
	
		this.raycaster.setFromCamera(mouse, this.camera);
	
		if (this.satelliteManager && this.satelliteManager.satellites.length > 0) {
			const meshes = this.satelliteManager.satellites.map(sat => sat.mesh);
			const intersects = this.raycaster.intersectObjects(meshes);
	
			if (intersects.length > 0) {
				const clickedMesh = intersects[0].object;
	
				// Deselect previous selection
				if (this.selectedMesh && this.selectedMesh !== clickedMesh) {
					this.resetClickedMesh();
				}
	
				// Select new satellite
				clickedMesh.material.color.set(0xffa500); // green highlight for selected
				clickedMesh.scale.set(2, 2, 2); // make it even bigger
	
				this.selectedSatellite = clickedMesh.userData;
				this.selectedMesh = clickedMesh;

				if (this.reactSetSelectedSatellite) {
					this.reactSetSelectedSatellite(clickedMesh);
				}
			} else {
				// Clicked on empty space
				if (this.selectedMesh) {
					this.resetClickedMesh();
				}
				this.selectedSatellite = null;
				this.selectedMesh = null;

				if (this.reactSetSelectedSatellite) {
					this.reactSetSelectedSatellite(null);
				}
			}
		}
	}

	resetClickedMesh() {
		this.selectedMesh.material.color.set(0xff0000);
		this.selectedMesh.scale.set(1, 1, 1);
	}

	addUpdateCallback(cb) {
        this.updateCallbacks.push(cb);
    }

	/**
	 * Renders the scene and updates the camera.
	 * Called repeatedly as part of the animation loop.
	 * @private
	 */
	_render() {
		for (const cb of this.updateCallbacks) {
            cb();
        }

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
