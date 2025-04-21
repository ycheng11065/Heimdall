import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';
import { GLOBE } from '../constants';

class Globe {
    constructor(radius = GLOBE.RADIUS, segments = GLOBE.SEGMENTS) {
        this.radius = radius;
        this.segments = segments;
        this.geometry = this.#createGeometry();
        this.material = this._createMaterial();
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

    _createMaterial() {
        const material = new MeshBasicMaterial({
            color: GLOBE.COLOR,
            wireframe: GLOBE.WIREFRAME,
            opacity: GLOBE.WIREFRAME_OPACITY,
        });
        return material;
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