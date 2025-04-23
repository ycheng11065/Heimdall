package com.application.server.repository;

import com.application.server.model.Earthquake.EarthquakeEntity;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface EarthquakeRepository extends ReactiveCrudRepository<EarthquakeEntity, UUID> {

    @Query("SELECT * FROM earthquakes WHERE preferred_event_id = :earthquakeID")
    Mono<EarthquakeEntity> findByEarthquakeId(@Param("earthquakeID") String earthquakeID);

    @Query("DELETE FROM earthquake WHERE event_time < NOW() - INTERVAL '30 days'")
    Mono<Void> deleteEarthquakesOlderThan30Days();
}