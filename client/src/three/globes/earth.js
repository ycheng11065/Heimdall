import Globe from "./globe";
import { fetchGeoJSON } from "../../api/geography";
import { GEO_FEATURE } from "../constants";
import { generateGeoPolygonMeshes, generateShapeIndices } from "../geometry/globeGeoRenderers";
import * as THREE from "three";
import { disposeGroup } from "../helper/disposal.js";

class Earth extends Globe {
    constructor(scene) {
        super();

        this.scene = scene;
        this.landMeshes = new THREE.Group();
        this.lakeMeshes = new THREE.Group();
        this.landIndices = new THREE.Group();
        this.lakeIndices = new THREE.Group();
        this._init();
    }

    _init() {
        this.scene.add(this.getGlobeMesh()); // add parent globe mesh to the scene
        this._initLand();
        this._initLakes();
    }

    _initLand() {
        fetchGeoJSON('ne_110m_land').then(geojson => {
            let landGroup = generateGeoPolygonMeshes(geojson, GEO_FEATURE.LAND);
            landGroup.forEach(mesh => {
                this.landMeshes.add(mesh);
            });

            this.landMeshes.name = "LandGroup";
            this.scene.add(this.landMeshes);
        }).catch(error => {
            console.error('Error processing GeoJSON:', error);
        });
    }

    _initLakes() {
        fetchGeoJSON('ne_110m_lakes').then(geojson => {
            let lakesGroup = generateGeoPolygonMeshes(geojson, GEO_FEATURE.LAKES);
            lakesGroup.forEach(mesh => {
                this.lakeMeshes.add(mesh);
            });

            this.lakeMeshes.name = "LakesGroup";
            this.scene.add(this.lakeMeshes);
        }).catch(error => {
            console.error('Error processing GeoJSON:', error);
        });
    }

    _generateLandIndices() {
        this.landMeshes.children.forEach(mesh => {
            const indices = generateShapeIndices(mesh.geometry);
            indices.forEach(index => {
                this.landIndices.add(index);
            });
        });

        this.landIndices.name = "LandIndices";
        this.landIndices.visible = false;
        this.scene.add(this.landIndices);
    }

    _generateLakeIndices() {
        this.lakeIndices = new THREE.Group();

        this.lakeMeshes.children.forEach(mesh => {
            const indices = generateShapeIndices(mesh.geometry);
            indices.forEach(index => {
                this.lakeIndices.add(index);
            });
        });

        this.lakeIndices.name = "LakeIndices";
        this.lakeIndices.visible = false;
        this.scene.add(this.lakeIndices);
    }

    showLand() {
        console.log(this.landMeshes);
        this.landMeshes.visible = true;
    }

    hideLand() {
        this.landMeshes.visible = false;
    }

    showLakes() {
        this.lakeMeshes.visible = true;
    }

    hideLakes() {
        this.lakeMeshes.visible = false;
    }

    showLandIndices() {
        if (this.landIndices.children.length === 0) {
            this._generateLandIndices();
        }

        this.landIndices.visible = true;
    }

    hideLandIndices() {
        this.landIndices.visible = false;
    }

    showLakeIndices() {
        if (this.lakeIndices.children.length === 0) {
            this._generateLakeIndices();
        }

        this.lakeIndices.visible = true;
    }

    hideLakeIndices() {
        this.lakeIndices.visible = false;
    }

    dispose() {
        super.dispose(this.scene);
    
        disposeGroup(this.landMeshes);
        disposeGroup(this.lakeMeshes);
        disposeGroup(this.landIndices);
        disposeGroup(this.lakeIndices);
        
        this.landMeshes = null;
        this.lakeMeshes = null;
        this.landIndices = null;
        this.lakeIndices = null;
    }
}

export default Earth;