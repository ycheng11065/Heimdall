package com.application.server.service;

import com.application.server.model.Satellite;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class SatelliteService {

    private final WebClient webClient;
//    private final String N2YO_API_URL = "https://api.n2yo.com/rest/v1/satellite/";
    private final String SPACE_TRACK_URL = " https://www.space-track.org/";

    // Injecting WebClient.Builder dependency
    public SatelliteService(WebClient.Builder webClientBuilder) {
        // Set API base URL
        this.webClient = webClientBuilder.baseUrl(SPACE_TRACK_URL).build();
    }

    public Mono<Satellite> getSatelliteData(int satelliteID) {
        //Request: /tle/{id}
        return webClient
                .get()
                .uri("/tle/{id}", satelliteID)
                .retrieve()
                .bodyToMono(Satellite.class);
    }
}
