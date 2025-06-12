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

        const geodetic = satellite.eciToGeodetic(eci.position, gmst);
        const latitude = satellite.degreesLat(geodetic.latitude);
        const longitude = satellite.degreesLong(geodetic.longitude);
        const altitude = geodetic.height;


        const satelliteMesh = createSatelliteMesh(satelliteDTO, position, latitude, longitude, altitude);
        this.scene.add(satelliteMesh);

        this.satellites.push({
            mesh: satelliteMesh,
            epoch: epoch,
            satrec: satrec
        });
    }

    async updateSatellites() {
        this.clock.update();

        for (const sat of this.satellites) {
            const minutesSinceEpoch = this.clock.getSimulatedMinutesSince(sat.epoch);

            const eci = satellite.sgp4(sat.satrec, minutesSinceEpoch);
            if (!eci || !eci.position) continue; 

            const gmst = satellite.gstime(this.clock.getSimulatedDate());
            const ecf  = satellite.eciToEcf(eci.position, gmst);

            const geodetic = satellite.eciToGeodetic(eci.position, gmst);
            const latitude = satellite.degreesLat(geodetic.latitude);
            const longitude = satellite.degreesLong(geodetic.longitude);
            const altitude = geodetic.height;

            setSatellitePosition(sat.mesh, [ecf.y, ecf.z, ecf.x], sat, latitude, longitude, altitude);
        }
    }

    setSpeed(multiplier) {
        if (multiplier == 1) {
            this.clock = new ClockManager();
        }
        this.clock.setSpeed(multiplier);
    }

    clearSatellites() {
        for (const sat of this.satellites) {
            this.scene.remove(sat.mesh);
            sat.mesh.geometry.dispose();
            sat.mesh.material.dispose();
        }

        this.satellites = [];
        this.clock = new ClockManager();
    }
}

export default SatelliteManager;
