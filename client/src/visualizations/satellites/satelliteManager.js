import { createSatelliteMesh } from '../../three/geometry/createSatelliteMesh.js';
import { compute_satellite_orbit, generate_orbit_path } from '../../wasm/spherekit/pkg/spherekit.js';
import * as THREE from 'three';
import { GLOBE } from '../../three/constants.js';
import ClockManager from './clock.js';

class SatelliteManager {
    constructor(scene) {
        this.scene = scene
        this.satellites = [];
        this.clock = new ClockManager();
    }

    async addSatellite(satelliteDTO) {
        const now = Date.now();
        const epoch = Date.parse(satelliteDTO.epoch); 
        
        const minutesSinceEpoch = (now - epoch) / 1000 / 60;
        
        const orbitResult = await compute_satellite_orbit(
            satelliteDTO.tleLine1,
            satelliteDTO.tleLine2,
            minutesSinceEpoch
        );

        const satelliteMesh = createSatelliteMesh(satelliteDTO, orbitResult.position);
        this.scene.add(satelliteMesh);

        const orbitCurve = await this.createOrbitCurve(satelliteDTO.tleLine1, satelliteDTO.tleLine2, minutesSinceEpoch);
        this.scene.add(orbitCurve);

        this.satellites.push({
            mesh: satelliteMesh,
            tleLine1: satelliteDTO.tleLine1,
            tleLine2: satelliteDTO.tleLine2,
            epoch
        });
    }

    async createOrbitCurve(tleLine1, tleLine2, startOffsetMinutes) {
        const minutesAhead = 90; // 1 full day (depends on orbit speed)
        const sampleInterval = 1; // Every 10 minutes (adjust for smoothness)
    
        const result = await generate_orbit_path(tleLine1, tleLine2, minutesAhead, sampleInterval, startOffsetMinutes);

        const pointsArray = result; 
        const scale = GLOBE.RADIUS / 6371;

        const points = [];
        for (let i = 0; i < pointsArray.length; i += 1) {
            // points.push(new THREE.Vector3(pointsArray[i][0] * scale, pointsArray[i][1] * scale,  pointsArray[i][2] * scale));
            points.push(new THREE.Vector3(pointsArray[i][0] * scale, pointsArray[i][2] * scale,  pointsArray[i][1] * scale));
        }
    
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const orbitLine = new THREE.Line(geometry, material);
    
        return orbitLine;
    }

    async updateSatellites() {
        this.clock.update(); 
        const scale = GLOBE.RADIUS / 6371;
        for (const sat of this.satellites) {
            const minutesSinceEpoch = this.clock.getSimulatedMinutesSince(sat.epoch);

    
            const orbitResult = await compute_satellite_orbit(
                sat.tleLine1,
                sat.tleLine2,
                minutesSinceEpoch
            );

            sat.mesh.position.set(
                orbitResult.position[0] * scale,
                orbitResult.position[2] * scale,
                orbitResult.position[1] * scale
            );
        }
    }

    setSpeed(multiplier) {
        this.clock.setSpeed(multiplier);
    }
}

export default SatelliteManager;
