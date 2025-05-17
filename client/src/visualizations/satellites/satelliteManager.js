import { createSatelliteMesh, setSatellitePosition } from '../../three/geometry/satelliteMeshUtils.js';
import { compute_satellite_orbit, generate_orbit_path } from '../../wasm/spherekit/pkg/spherekit.js';
import * as THREE from 'three';
import { GLOBE, EARTH } from '../../three/constants.js';
import ClockManager from './clock.js';
import * as satellite from 'satellite.js';

class SatelliteManager {
    constructor(scene) {
        this.scene = scene
        this.satellites = [];
        this.clock = new ClockManager();
    }

    async addSatellite(satelliteDTO) {
        // console.log(satelliteDTO);
        const now = new Date();
        const epoch = Date.parse(satelliteDTO.epoch); 
        
        const satrec = satellite.twoline2satrec(satelliteDTO.tleLine1, satelliteDTO.tleLine2);
        
        const eci = satellite.propagate(satrec, now);

        if (!eci || !eci.position) {
            console.warn("Propagation failed for:", satelliteDTO.name);
            return;
        }

        const gmst = satellite.gstime(now);

        const ecf  = satellite.eciToEcf(eci.position, gmst);

        const position = [ecf.y, ecf.z, ecf.x];


        const satelliteMesh = createSatelliteMesh(satelliteDTO, position);
        this.scene.add(satelliteMesh);

        this.satellites.push({
            mesh: satelliteMesh,
            epoch: epoch,
            satrec: satrec
        });
    }

    // async createOrbitCurve(tleLine1, tleLine2, startOffsetMinutes) {
    //     const minutesAhead = 90; // 1 full day (depends on orbit speed)
    //     const sampleInterval = 1; // Every 10 minutes (adjust for smoothness)
    
    //     const result = await generate_orbit_path(tleLine1, tleLine2, minutesAhead, sampleInterval, startOffsetMinutes);

    //     const pointsArray = result; 
    //     const scale = GLOBE.RADIUS / 6371;

    //     const points = [];
    //     for (let i = 0; i < pointsArray.length; i += 1) {
    //         // points.push(new THREE.Vector3(pointsArray[i][0] * scale, pointsArray[i][1] * scale,  pointsArray[i][2] * scale));
    //         points.push(new THREE.Vector3(pointsArray[i][0] * scale, pointsArray[i][2] * scale,  pointsArray[i][1] * scale));
    //     }
    
    //     const geometry = new THREE.BufferGeometry().setFromPoints(points);
    //     const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    //     const orbitLine = new THREE.Line(geometry, material);
    
    //     return orbitLine;
    // }

    async updateSatellites() {
        this.clock.update();

        for (const sat of this.satellites) {
            const minutesSinceEpoch = this.clock.getSimulatedMinutesSince(sat.epoch);

            const eci = satellite.sgp4(sat.satrec, minutesSinceEpoch);
            if (!eci || !eci.position) continue; 

            const gmst = satellite.gstime(this.clock.getSimulatedDate());
            const ecf  = satellite.eciToEcf(eci.position, gmst);

            setSatellitePosition(sat.mesh, [ecf.y, ecf.z, ecf.x]);
        }
    }

    // async updateSatellites() {
    //     this.clock.update(); 
    //     const scale = GLOBE.RADIUS / 6371;
    //     const nowMillis = Date.now();

    //     for (const sat of this.satellites) {
    //         const minutesSinceEpoch = this.clock.getSimulatedMinutesSince(sat.epoch);

    
    //         const orbitResult = await compute_satellite_orbit(
    //             sat.tleLine1,
    //             sat.tleLine2,
    //             minutesSinceEpoch
    //         );

    //         sat.mesh.position.set(
    //             orbitResult.position[0] * scale,
    //             orbitResult.position[2] * scale,
    //             orbitResult.position[1] * scale,
    //             nowMillis
    //         );
    //     }
    // }

    setSpeed(multiplier) {
        this.clock.setSpeed(multiplier);
    }
}

export default SatelliteManager;
