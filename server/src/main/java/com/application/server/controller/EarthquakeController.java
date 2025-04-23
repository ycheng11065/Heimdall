package com.application.server.controller;

import com.application.server.model.Earthquake.Earthquake;
import com.application.server.service.EarthquakeService;
import com.application.server.service.SatelliteService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/earthquakes")
public class EarthquakeController {

    private final EarthquakeService earthquakeService;

    public EarthquakeController(EarthquakeService earthquakeService)
    {
        this.earthquakeService = earthquakeService;
    }

//    @GetMapping
//    public Flux<Earthquake> getAllEarthquakes() {
//        return earthquakeService.
//    }
}
