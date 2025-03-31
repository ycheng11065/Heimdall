package com.application.server.repository;

import com.application.server.model.SatelliteEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import java.util.UUID;

public interface SatelliteRepository extends ReactiveCrudRepository<SatelliteEntity, UUID> {
}