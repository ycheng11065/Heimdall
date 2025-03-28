package com.application.server.service;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class SpaceTrackAuthService {

    private final WebClient webClient;
    private final String SPACE_TRACK_URL = "https://www.space-track.org/";
    private String sessionCookie;

    public SpaceTrackAuthService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(SPACE_TRACK_URL).build();
    }

    public Mono<String> login() {
        if (sessionCookie != null) {
            return Mono.just(sessionCookie);
        }

        return webClient.post()
                .uri("/ajaxauth/login")
                .bodyValue("identity=your_username&password=your_password")
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        String cookie = response.headers()
                                .asHttpHeaders()
                                .getFirst(HttpHeaders.SET_COOKIE);
                        this.sessionCookie = cookie;
                        return Mono.just(cookie);
                    } else {
                        return Mono.error(new RuntimeException("Login failed: " + response.statusCode()));
                    }
                });
    }

    public String getSessionCookie() {
        return sessionCookie;
    }
}
