import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
import { GLOBE } from '../constants';

class Globe {
    constructor(radius = GLOBE.RADIUS, segments = GLOBE.SEGMENTS) {
        this.radius = radius;
        this.segments = segments;
        this.material = this.#createMaterial();
        this.geometry = this.#createGeometry();
        this.mesh = this.#createMesh();
    }
    
    #createGeometry() {
        const geometry = new SphereGeometry(this.radius, this.segments, this.segments);
        return geometry;
    }

    #createMesh() {
        const mesh = new Mesh(this.geometry, this.material);
        return mesh;
    }

    #createMaterial() {
        const material = new MeshBasicMaterial({
            color: GLOBE.COLOR,
            wireframe: GLOBE.WIREFRAME,
            transparent: GLOBE.TRANSPARENT,
            opacity: GLOBE.OPACITY,
        });
        return material;
    }

    setColor(color) {
        this.material.color.set(color);
    }

    setWireframe(wireframe) {
        this.material.wireframe = wireframe;
    }

    setOpacity(opacity) {
        this.material.opacity = opacity;
    }
    
    setTransparent(transparent) {
        this.material.transparent = transparent;
    }

    getMesh() {
        return this.mesh;
    }

    getRadius() {
        return this.radius;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
};

export default Globe;