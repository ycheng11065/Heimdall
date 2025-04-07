package com.application.server.service;

import com.application.server.model.Earthquake.Earthquake;
import com.application.server.model.Earthquake.EarthquakeEntity;
import com.application.server.model.Earthquake.EarthquakeFeatureCollection;
import com.application.server.model.Earthquake.EarthquakeMapper;
import com.application.server.model.Satellite.Satellite;
import com.application.server.model.Satellite.SatelliteEntity;
import com.application.server.model.Satellite.SatelliteMapper;
import com.application.server.repository.EarthquakeRepository;
import jakarta.annotation.PostConstruct;
import org.apache.catalina.startup.Tomcat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.relational.core.sql.Update;
import org.springframework.http.HttpHeaders;
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

    public Flux<Earthquake> queryEarthquakeData(String endpoint) {
//        return webClient.get().uri(endpoint).retrieve().bodyToFlux(Earthquake.class);
        return webClient.get()
                .uri(endpoint)
                .retrieve()
                .bodyToMono(EarthquakeFeatureCollection.class)
                .flatMapMany(collection -> Flux.fromIterable(collection.getFeatures()));
    }

    public Flux<Earthquake> getPastMonthData() {
        System.out.println("Fetching all earthquake data from the past 30 days");

        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedStart = start.format(formatter);
        String formattedEnd = end.format(formatter);

        String endpoint = "/query?format=geojson&starttime=" + formattedStart + "&endtime=" + formattedEnd + "&minmagnitude=2.5";
        System.out.println(endpoint);
        return queryEarthquakeData(endpoint);
    }

    public Flux<EarthquakeEntity> RefreshDatabase() {
        return getPastMonthData()
                .flatMap(this::UpdateEarthquakeDatabase)
                .doOnNext(updated -> System.out.println("Processed: earthquake ID " + updated.getEarthquakeId()))
                .doOnError(err -> System.err.println("Process error: " + err.getMessage()))
                .doOnComplete(() -> System.out.println("Earthquake update protocol complete!"));
    }

    private void UpdateEarthquakeData(EarthquakeEntity existing, Earthquake updated) {
        existing.setMag(updated.getProperties().getMag());
        existing.setCdi(updated.getProperties().getCdi());
        existing.setMmi(updated.getProperties().getMmi());
        existing.setAlert(updated.getProperties().getAlert());
        existing.setStatus(updated.getProperties().getStatus());
        existing.setSignificance(updated.getProperties().getSignificance());
        existing.setNst(updated.getProperties().getNst());
        existing.setDmin(updated.getProperties().getDmin());
        existing.setType(updated.getProperties().getType());
        existing.setDepth(updated.getGeometry().getDepth());
        existing.setAllKnownIds(updated.getProperties().getIds());
        existing.setLastUpdate(LocalDateTime.now());

        // Process usgs update time to local time
        LocalDateTime localUpdated = Instant.ofEpochMilli(updated.getProperties().getUpdated())
                .atZone(ZoneId.systemDefault()) // Use computer/server’s zone
                .toLocalDateTime();
        existing.setUpdated(localUpdated);

        // Rarely change but safe precaution
        existing.setPlace(updated.getProperties().getPlace());
        existing.setTz(updated.getProperties().getTz());
        existing.setLongitude(updated.getGeometry().getLongitude());
        existing.setLatitude(updated.getGeometry().getLatitude());
        existing.setTsunami(updated.getProperties().getTsunami());
    }

    public Mono<EarthquakeEntity> UpdateEarthquakeDatabase(Earthquake updatedEarthquake) {
        return earthquakeRepository.findByEarthquakeId(updatedEarthquake.getEarthquakeId())
                .flatMap(existing -> {
                    boolean updateTimeChanged = !existing
                            .getUpdated()
                            .equals(updatedEarthquake.getProperties().getUpdated());

                    if (!updateTimeChanged) {
                        System.out.println("Earthquake " + existing.getEarthquakeId() + " does not require update!");
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
                                        existing.setEarthquakeId(updatedEarthquake.getEarthquakeId());
                                        existing.setAllKnownIds(updatedEarthquake.getProperties().getIds());
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
}
