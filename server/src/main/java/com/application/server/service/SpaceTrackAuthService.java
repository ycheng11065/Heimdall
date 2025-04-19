package com.application.server.service;

import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.beans.factory.annotation.Value;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class SpaceTrackAuthService {

    private final WebClient.Builder webClientBuilder;
    private WebClient webClient;
    private String sessionCookie;

    @Value("${spacetrack.base}")
    private String baseUrl;

    @Value("${spacetrack.username}")
    private String username;

    @Value("${spacetrack.password}")
    private String password;

    public SpaceTrackAuthService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @PostConstruct
    private void init() {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public Mono<String> login() {
        if (sessionCookie != null) {
            return Mono.just(sessionCookie);
        }

        System.out.println("Logging in to SpaceTrack");

        String encodedUsername =  URLEncoder.encode(username, StandardCharsets.UTF_8);
        String encodePassword = URLEncoder.encode(password, StandardCharsets.UTF_8);
        String body = "identity=" + encodedUsername + "&password=" + encodePassword;

        return webClient.post()
                .uri("/ajaxauth/login")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .bodyValue(body)
                .exchangeToMono(response -> {
                    if (response.statusCode().is2xxSuccessful()) {
                        String cookie = response.headers()
                                .asHttpHeaders()
                                .getFirst(HttpHeaders.SET_COOKIE);
                        this.sessionCookie = cookie;

                        System.out.println("Using session cookie: " + cookie);
                        return Mono.just(cookie);
                    } else {
                        return response.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    System.err.println("Login failed:\n" + errorBody);
                                    return Mono.error(new RuntimeException("Login failed: " + response.statusCode()));
                                });
                    }
                });
    }

    public String getSessionCookie() {
        return sessionCookie;
    }
}
