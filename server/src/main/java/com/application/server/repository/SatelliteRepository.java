package com.application.server.repository;

import com.application.server.model.SatelliteEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface SatelliteRepository extends ReactiveCrudRepository<SatelliteEntity, UUID> {
    Mono<SatelliteEntity> findByNoradCatId(int noradCatId);
}