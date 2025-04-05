package com.application.server.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class EarthquakeService {
    private final WebClient.Builder webClientBuilder;


    public EarthquakeService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }
}
