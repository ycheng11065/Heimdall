import * as THREE from 'three';
import GlobeCamera from './camera.js';
import vertexShader from './shaders/vertex.vert';
import fragmentShader from './shaders/fragment.frag';
import earcut from 'earcut';

const GeoFeature = {
    COASTLINE: 1,
    RIVERS: 2,
}


export const main = async (canvas) => {

    /**********************************************/
    /* Canvas, window, camera, and renderer setup */
    /**********************************************/

    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new GlobeCamera(renderer, canvas);

    const onWindowResize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        renderer.setSize(width, height, false);
        camera.updateAspect(width, height);
    }

    window.addEventListener('resize', onWindowResize);

    /**********************************************/
    /*              Base earth setup              */
    /**********************************************/

    const geometry = new THREE.SphereGeometry(1, 32, 32);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            baseColor: { value: new THREE.Color(0x14b1d9) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);



    /**********************************************/
    /*              Base lines setup              */
    /**********************************************/


    fetchGeoJSON('ne_110m_coastline').then(geojson => {
        renderGeoLines(geojson, scene, GeoFeature.COASTLINE);
    }).catch(error => {
        console.error('Error processing GeoJSON:', error);
    });
    
    fetchGeoJSON('ne_110m_rivers_lake_centerlines').then(geojson => {
        renderGeoLines(geojson, scene, GeoFeature.RIVERS);
    }).catch(error => {
        console.error('Error processing GeoJSON:', error);
    });

    fetchGeoJSON('ne_110m_lakes').then(geojson => {
        renderGeoPolygons(geojson, scene);
    }).catch(error => {
        console.error('Error processing GeoJSON:', error);
    });



    /**********************************************/
    /*                 Main loop                  */
    /**********************************************/

    function render(/*time*/) {
        // time *= 0.001; // convert time to seconds

        renderer.render(scene, camera);
        camera.update();

        animationFrameId = requestAnimationFrame(render);
    }

    let animationFrameId = requestAnimationFrame(render);

    return () => {
        window.removeEventListener('resize', onWindowResize);
        cancelAnimationFrame(animationFrameId);
        camera.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
}


// TEMPORARY to work on visualization
function renderGeoLines(data, scene, geoFeature) {
    const features = data.features;

    features.forEach(feature => {
        if (feature.geometry.type === "LineString") {
            const points = [];

            feature.geometry.coordinates.forEach(coord => {
                const [longitude, latitude] = coord;
                const point = latLongToVector3(latitude, longitude, 1.001); // .001 to be slightly above globe
                points.push(point);
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            let material;
            switch (geoFeature) {
                case GeoFeature.COASTLINE:
                    material = new THREE.LineBasicMaterial({ 
                        color: 0xFFFFFF,
                        linewidth: 1
                    });
                    break;
                case GeoFeature.RIVERS:
                    material = new THREE.LineBasicMaterial({ 
                        color: 0x0000FF,
                        linewidth: 1
                    });
                    break;
                default:
                    material = new THREE.LineBasicMaterial({ 
                        color: 0xFFFFFF,
                        linewidth: 1
                    });
            }

            const line = new THREE.Line(geometry, material);
            scene.add(line);
        }
    });
}

// TEMPORARY to work on visualization
function renderGeoPolygons(data, scene) {
    const features = data.features;
    
    features.forEach(feature => {
        if (feature.geometry.type === "Polygon") {
            const positions = [];
            const flatPositions = [];
            
            feature.geometry.coordinates[0].forEach(coord => {
                const [longitude, latitude] = coord;
                const point = latLongToVector3(latitude, longitude, 1.002); 
                positions.push(point);
                flatPositions.push(point.x, point.y, point.z);
            });
            
            
            const vertices = [];
            const holeIndices = [];
            
            const projectedPoints = projectToPlane(positions);
            
            projectedPoints.forEach(pt => {
                vertices.push(pt.x, pt.y);
            });
            
            const indices = earcut(vertices, holeIndices);
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatPositions, 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();
            
            const material = new THREE.MeshBasicMaterial({
                color: 0x0000FF,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }
    });
}

// TEMPORARY to work on visualization
function projectToPlane(points) {
    const center = new THREE.Vector3();
    points.forEach(p => center.add(p));
    center.divideScalar(points.length);
    
    const normal = center.clone().normalize();
    
    const tempVec = new THREE.Vector3(1, 0, 0);
    if (Math.abs(normal.dot(tempVec)) > 0.9) {
        tempVec.set(0, 1, 0);
    }
    
    const xAxis = new THREE.Vector3().crossVectors(normal, tempVec).normalize();
    const yAxis = new THREE.Vector3().crossVectors(normal, xAxis).normalize();
    
    return points.map(p => {
        const relativePoint = p.clone().sub(center);
        return new THREE.Vector2(
            relativePoint.dot(xAxis),
            relativePoint.dot(yAxis)
        );
    });
}


// TEMPORARY to work on visualization
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}





// TEMPORARY to work on visualization
async function fetchGeoJSON(file_name) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${file_name}/${file_name}.geojson`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('GeoJSON fetch failed:', error);
        throw error;
    }
}