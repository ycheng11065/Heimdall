package com.application.server.service;

import com.application.server.model.Satellite;
import com.application.server.model.SatelliteEntity;
import com.application.server.model.SatelliteMapper;
import com.application.server.repository.SatelliteRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.http.HttpHeaders;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SatelliteService {
    private static final List<Integer> IMPORTANT_NORAD_IDS = List.of(
            20580, // Hubble
            25544, // ISS
            48274, // Tiangong
            39084, // Landsat 8
            49260, // Landsat 9
            27386, // Envisat
            27424, // Aqua
            25994, // Terra
            41240, // Jason-3
            39634, // Sentinel-1A
            41456, // Sentinel-1B
            40697, // Sentinel-2A
            42063, // Sentinel-2B
            43613, // ICESat-2
            41866, // GOES-16 (East)
            53106  // GOES-18 (West)
    );

    private final WebClient.Builder webClientBuilder;
    private final SpaceTrackAuthService authService;
    private final SatelliteRepository satelliteRepository;
    private WebClient webClient;

    @Value("${spacetrack.base}")
    private String baseUrl;

    @Value("${spacetrack.all}")
    private String allActiveSatellitesEndpoint;

    @Value("${spacetrack.starlink}")
    private String spaceLinkSatellitesEndpoint;

    @Value("${spacetrack.oneweb}")
    private String oneWebSatellitesEndpoint;

    @Value("${spacetrack.iridium}")
    private String iridiumSatellitesEndpoint;

    // Injecting WebClient.Builder dependency
    public SatelliteService(
            WebClient.Builder webClientBuilder,
            SpaceTrackAuthService authService,
            SatelliteRepository satelliteRepository) {

        // Set API base URL
        this.webClientBuilder = webClientBuilder;
        this.authService = authService;
        this.satelliteRepository = satelliteRepository;
    }

    @PostConstruct
    private void init() {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public Flux<Satellite> getAllSatelliteData() {
        System.out.println("Fetching all satellite data");
        return querySatelliteGroup(allActiveSatellitesEndpoint);
    }

    public Flux<Satellite> getAllStarlinkData() {
        System.out.println("Fetching all Starlink data");
        return querySatelliteGroup(spaceLinkSatellitesEndpoint);
    }

    // Query all One Web satellites
    public Flux<Satellite> getAllOneWebData() {
        System.out.println("Fetching all One Web data");
        return querySatelliteGroup(oneWebSatellitesEndpoint);
    }

    // Query all Iridium satellites
    public Flux<Satellite> getAllIridiumData() {
        System.out.println("Fetching all Iridium data");
        return querySatelliteGroup(iridiumSatellitesEndpoint);
    }

    // Query all important historical satellites (for space nerds)
    public Flux<Satellite> getImportantSatellitesData() {
        String ids = IMPORTANT_NORAD_IDS.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));

        String endpoint = "/basicspacedata/query/class/gp/decay_date/null-val/epoch/>now-30/NORAD_CAT_ID/" + ids + "/orderby/norad_cat_id/format/json";
        return querySatelliteGroup(endpoint);
    }

    // Query satellite data that contains parameter name in OBJECT_NAME field
    public Flux<Satellite> getSearchedSatellitesData(String name) {
        String endpoint = "/basicspacedata/query/class/gp/decay_date/null-val/epoch/>now-30/OBJECT_NAME/~~" + name + "/orderby/norad_cat_id/format/json";
        return querySatelliteGroup(endpoint);
    }

    // Query satellite data related to the parameter noradId in NORAD_CAT_ID field
    public Flux<Satellite> getNORADSatelliteData(int noradId) {
        String endpoint = "/basicspacedata/query/class/gp/decay_date/null-val/epoch/>now-30/NORAD_CAT_ID/" + noradId + "/format/json";
        return querySatelliteGroup(endpoint);
    }

    public Flux<Satellite> querySatelliteGroup(String endpoint) {
        return authService.login()
                .flatMapMany(cookie ->
                        webClient
                                .get()
                                .uri(endpoint)
                                .header(HttpHeaders.COOKIE, cookie)
                                .retrieve()
                                .bodyToFlux(Satellite.class)
                );
    }

    public Mono<SatelliteEntity> saveSatelliteToDb(Satellite satellite) {
        SatelliteEntity entity = SatelliteMapper.toEntity(satellite);
        return satelliteRepository.save(entity);
    }

    public Flux<SatelliteEntity> saveAllSatelliteToDb(Flux<Satellite> satellites) {
        return satellites.map(SatelliteMapper::toEntity).flatMap(satelliteRepository::save);
    }
}
