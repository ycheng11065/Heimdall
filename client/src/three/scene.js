import * as THREE from 'three';
import GlobeCamera from './camera.js';
import Earth from './globes/earth.js';

class GlobeSceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.earth = null;
        this.animationFrameId = null;

        this._onWindowResize = this._onWindowResize.bind(this);
        this.render = this.render.bind(this);

        this.init();
    }

    init() {
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

        this.earth = new Earth();
        this.scene.add(this.earth.getMesh());
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        this.camera.update();

        this.animationFrameId = requestAnimationFrame(this.render);
    }

    startAnimationLoop() {
        if (!this.animationFrameId) {
            this.animationFrameId = requestAnimationFrame(this.render);
            this.render();
        }
    }

    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    dispose() {
        this.stopAnimationLoop();
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this._onWindowResize);
        this.renderer.dispose();
        this.camera.dispose();
        this.earth.dispose();
    }

    _onWindowResize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.renderer.setSize(width, height, false);
        this.camera.updateAspect(width, height);
    }
}

export default GlobeSceneManager;