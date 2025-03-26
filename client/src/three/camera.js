import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CONST from './constants.js';

/**
 * A specialized camera class for globe visualization with enhanced control features.
 * Extends THREE.PerspectiveCamera and provides automatic resizing and orbit controls.
 *
 * @class
 * @extends {THREE.PerspectiveCamera}
 */
class GlobeCamera extends THREE.PerspectiveCamera {
    /**
     * Creates a new GlobeCamera instance with orbit controls and automatic resize handling.
     *
     * @param {THREE.Renderer} renderer - The WebGL renderer to associate with the camera
     * @param {HTMLElement} container - The DOM container element for size calculations and resize observation
     * @throws {Error} Will throw an error if renderer or container is invalid
     */
    constructor(renderer, container) {
        // Initialize base perspective camera with predefined constants
        super(
            CONST.CAMERA_FOV,
            container.clientWidth / container.clientHeight,
            CONST.CAMERA_NEAR,
            CONST.CAMERA_FAR
        );

        // Set initial camera position based on constants
        this.position.set(...CONST.CAMERA_POSITION);
        this.lookAt(...CONST.CAMERA_LOOK_AT);

        // Create orbit controls for interactive camera movement
        this.controls = new OrbitControls(this, renderer.domElement);
        this.controls.enableDamping = true;

        // Set up resize observer to handle dynamic container resizing
        this.resizeObserver = new ResizeObserver(this.resize.bind(this));
        this.resizeObserver.observe(container);
    }

    /**
     * Handles camera and renderer resizing based on container dimensions.
     * Updates camera aspect ratio and renderer size accordingly.
     *
     * @param {ResizeObserverEntry[]} [entries] - Array of resize observer entries
     * @param {ResizeObserverEntry} [entries[0]] - The first resize observer entry
     * @param {DOMRectReadOnly} [entries[0].contentRect] - The new dimensions of the observed element
     */
    resize(entries) {
        if (entries && entries.length > 0) {
            const { width, height } = entries[0].contentRect;
            
            // Update camera aspect ratio
            this.aspect = width / height;
            this.updateProjectionMatrix();
            
            // Resize renderer if available
            if (this.renderer) {
                this.renderer.setSize(width, height);
            }
        }
    }

    /**
     * Updates the orbit controls, necessary for smooth camera interaction
     * when controls.enableDamping is set to true.
     * 
     * @method
     * @description Should be called in the animation loop to ensure
     * smooth camera movement and responsiveness.
     */
    update() {
        this.controls.update();
    }

    /**
     * Cleans up resources associated with the camera.
     * Stops resize observation and disposes of orbit controls.
     *
     * @description This method should be called when the camera is no longer needed
     * to prevent memory leaks and remove event listeners.
     */
    dispose() {
        // Stop observing resize events
        if (this.resizeObserver && this.container) {
            this.resizeObserver.unobserve(this.container);
        }
        
        // Dispose of orbit controls
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

export default GlobeCamera;