package com.application.server.service;

import com.application.server.model.Earthquake.Earthquake;
import com.application.server.model.Earthquake.EarthquakeEntity;
import com.application.server.model.Earthquake.EarthquakeFeatureCollection;
import com.application.server.model.Earthquake.EarthquakeMapper;
import com.application.server.repository.EarthquakeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.format.DateTimeFormatter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class EarthquakeService {
    private final WebClient.Builder webClientBuilder;
    private final EarthquakeRepository earthquakeRepository;
    private WebClient webClient;

    @Value("${usgs.base}")
    private String baseUrl;

    public EarthquakeService(
            WebClient.Builder webClientBuilder,
            EarthquakeRepository earthquakeRepository
    ) {
        this.webClientBuilder = webClientBuilder;
        this.earthquakeRepository = earthquakeRepository;
    }

    @PostConstruct
    public void init() {
        webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public Flux<Earthquake> fetchEarthquakeFeatures(String endpoint) {
        return webClient.get()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(EarthquakeFeatureCollection.class)
                .flatMapMany(collection -> Flux.fromIterable(collection.getFeatures()));
    }

    public Flux<Earthquake> fetchRecentEarthquakes() {
        System.out.println("Fetching all earthquake data from the past 24 hours UTC");

        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedStart = start.format(formatter);
        String formattedEnd = end.format(formatter);

        String endpoint = "/query?format=geojson&starttime=now-1day&minmagnitude=2.5";
        System.out.println(endpoint);
        return fetchEarthquakeFeatures(endpoint);
    }

    public Flux<EarthquakeEntity> syncEarthquakeData() {
        return fetchRecentEarthquakes()
                .flatMap(this::UpdateEarthquakeDatabase)
                .doOnNext(updated -> System.out.println("Processed: earthquake ID " + updated.getPreferred_event_id()))
                .doOnError(err -> System.err.println("Process error: " + err.getMessage()))
                .doOnComplete(() -> System.out.println("Earthquake update protocol complete!"));
    }

    private void UpdateEarthquakeData(EarthquakeEntity existing, Earthquake updated) {
        existing.setMagnitude(updated.getProperties().getMag());
        existing.setCommunity_intensity_cdi(updated.getProperties().getCdi());
        existing.setMercalli_intensity_mmi(updated.getProperties().getMmi());
        existing.setUsgs_alert_level(updated.getProperties().getAlert());
        existing.setProcessing_status(updated.getProperties().getStatus());
        existing.setEvent_significance(updated.getProperties().getSignificance());
        existing.setStation_count(updated.getProperties().getNst());
        existing.setMin_station_distance_deg(updated.getProperties().getDmin());
        existing.setEvent_type(updated.getProperties().getType());
        existing.setDepth_km(updated.getGeometry().getDepth());
        existing.setKnown_event_ids(updated.getProperties().getIds());
        existing.setLastUpdated(Instant.now());

        // Process usgs update time to local time
        Instant updateInstant = Instant.ofEpochMilli(updated.getProperties().getUpdated());
        existing.setUsgs_update_time(updateInstant);

        // Rarely change but safe precaution
        existing.setLocation_description(updated.getProperties().getPlace());
        existing.setTimezone_offset_minutes(updated.getProperties().getTz());
        existing.setEpicenter_longitude(updated.getGeometry().getLongitude());
        existing.setEpicenter_latitude(updated.getGeometry().getLatitude());
        existing.setTsunami_potential(updated.getProperties().getTsunami());
    }

    public Mono<EarthquakeEntity> UpdateEarthquakeDatabase(Earthquake updatedEarthquake) {
        return earthquakeRepository.findByEarthquakeId(updatedEarthquake.getEarthquakeId())
                .flatMap(existing -> {
                    boolean updateTimeChanged = !existing
                            .getUsgs_update_time()
                            .equals(Instant.ofEpochMilli(updatedEarthquake.getProperties().getUpdated()));

                    if (!updateTimeChanged) {
                        System.out.println("Earthquake " + existing.getPreferred_event_id() + " does not require update!");
                        return Mono.just(existing); // nothing to update
                    }

                    UpdateEarthquakeData(existing, updatedEarthquake);

                    return earthquakeRepository.save(existing); // write to DB
                })
                .switchIfEmpty( // handle new satellite
                        Mono.defer(() -> {
                            return Flux.fromIterable(updatedEarthquake.getProperties().getKnowIds())
                                    .flatMapSequential(id ->
                                            earthquakeRepository.findByEarthquakeId(id)
                                    )
                                    .next()
                                    .flatMap(existing -> {
                                        System.out.println("Earthquake changed ID to " + updatedEarthquake.getEarthquakeId() + "!");
                                        existing.setPreferred_event_id(updatedEarthquake.getEarthquakeId());
                                        existing.setKnown_event_ids(updatedEarthquake.getProperties().getIds());
                                        UpdateEarthquakeData(existing, updatedEarthquake);
                                        return earthquakeRepository.save(existing); // write to DB
                                    })
                                    .switchIfEmpty(
                                            Mono.defer(() -> {
                                                System.out.println("New earthquake " + updatedEarthquake.getEarthquakeId() + " discovered!");
                                                EarthquakeEntity newEarthquake = EarthquakeMapper.toEntity(updatedEarthquake);
                                                return earthquakeRepository.save(newEarthquake);
                                            })
                                    );
                        }));
    }

    public Mono<Void> cleanupEarthquakeData() {
        return earthquakeRepository
                .deleteEarthquakesOlderThan30Days()
                .doOnSuccess(unused -> System.out.println("Old earthquake data successfully removed!"))
                .doOnError(err -> System.err.println("Failed to clean up old earthquake data: " + err.getMessage()));
    }
}
