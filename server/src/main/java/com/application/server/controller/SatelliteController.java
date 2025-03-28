package com.application.server.controller;

import com.application.server.model.Satellite;
import com.application.server.service.SatelliteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/satellites")
public class SatelliteController {

    private final SatelliteService satelliteService;

    public SatelliteController(SatelliteService satelliteService) {
        this.satelliteService = satelliteService;
    }

    @GetMapping("/{id}")
    public Mono<Satellite> getSatellite() {

    }

    @GetMapping
    public Flux<Satellite> getAllSatellites() {
        return satelliteService.getAllSatelliteData();
    }
}
