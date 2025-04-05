package com.application.server.repository;

import com.application.server.model.EarthquakeEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EarthquakeRepository extends ReactiveCrudRepository<EarthquakeEntity, UUID> {
}