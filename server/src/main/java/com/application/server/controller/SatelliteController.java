package com.application.server.controller;

import ch.qos.logback.core.net.SyslogOutputStream;
import com.application.server.model.Satellite;
import com.application.server.model.SatelliteEntity;
import com.application.server.service.SatelliteService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/satellites")
public class SatelliteController {

    private final SatelliteService satelliteService;

    public SatelliteController(SatelliteService satelliteService) {
        this.satelliteService = satelliteService;
    }

    @PostMapping
    public Mono<SatelliteEntity> saveSatelliteToDb(@RequestBody Satellite satellite) {
        return satelliteService.saveSatelliteToDb(satellite);
    }

    @PostMapping("/batch")
    public Flux<SatelliteEntity> saveSatelliteToDb(@RequestBody List<Satellite> satellites) {
        return satelliteService.saveAllSatelliteToDb(Flux.fromIterable(satellites));
    }

    @GetMapping
    public Flux<Satellite> getAllSatellites() {
        return satelliteService.getAllSatelliteData();
    }

    @GetMapping("/starlink")
    public Flux<Satellite> getStarlinkSatellites() {
        return satelliteService.getAllStarlinkData();
    }

    @GetMapping("/oneweb")
    public Flux<Satellite> getOneWebSatellites() {
        return satelliteService.getAllOneWebData();
    }

    @GetMapping("/iridium")
    public Flux<Satellite> getIridiumSatellites() {
        return satelliteService.getAllIridiumData();
    }

    @GetMapping("/history")
    public Flux<Satellite> getHistoricalSatellites() {
        return satelliteService.getImportantSatellitesData();
    }

    @GetMapping("/search/{name}")
    public Flux<Satellite> getHistoricalSatellites(@PathVariable String name) {
        return satelliteService.getSearchedSatellitesData(name);
    }

    @GetMapping("/norad/{noradId}")
    public Flux<Satellite> getHistoricalSatellites(@PathVariable int noradId) {
        return satelliteService.getNORADSatelliteData(noradId);
    }

    @GetMapping("/all/populate")
    public Flux<SatelliteEntity> populateAllSatellites() {

        return satelliteService.populateAllSatellites();
    }
}
