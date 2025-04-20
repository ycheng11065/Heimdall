package com.application.server.repository;

import com.application.server.model.Satellite.SatelliteEntity;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface SatelliteRepository extends ReactiveCrudRepository<SatelliteEntity, UUID> {

    @Query("SELECT * FROM satellites WHERE norad_cat_id = :noradCatId")
    Mono<SatelliteEntity> findByNoradCatId(@Param("noradCatId") int noradCatId);
}