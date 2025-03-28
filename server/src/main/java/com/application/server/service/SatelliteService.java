package com.application.server.service;

import com.application.server.model.Satellite;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//import java.net.http.HttpHeaders;
import org.springframework.http.HttpHeaders;

@Service
public class SatelliteService {

    private final WebClient webClient;
    private final String SPACE_TRACK_URL = "https://www.space-track.org/";
    private final SpaceTrackAuthService authService;

    // Injecting WebClient.Builder dependency
    public SatelliteService(WebClient.Builder webClientBuilder, SpaceTrackAuthService authService) {
        // Set API base URL
        this.webClient = webClientBuilder.baseUrl(SPACE_TRACK_URL).build();
        this.authService = authService;
    }

    public Flux<Satellite> getAllSatelliteData() {
        String allSatelliteData =
                "/basicspacedata/query/class/gp/decay_date/null-val/epoch/%3Enow-30/orderby/norad_cat_id/format/json";

        return authService.login()
                .flatMapMany(cookie ->
                        webClient
                                .get()
                                .uri(allSatelliteData)
                                .header(HttpHeaders.COOKIE, cookie)
                                .retrieve()
                                .bodyToFlux(Satellite.class)
                );
    }
}
