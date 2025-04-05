package com.application.server.service;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
public class MaintenanceService {
    private final DatabaseClient databaseClient;

    LocalDateTime lastCleanupTime;

    public MaintenanceService(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    public Mono<Void> runVacuumAnalysis() {
        return databaseClient.sql("VACUUM ANALYZE satellites")
                .then()
                .doOnError(err -> System.out.println("Error on vacuum of database!"))
                .doOnSuccess(s -> {
                    lastCleanupTime = LocalDateTime.now();
                    System.out.println("Completed vacuuming database at " + lastCleanupTime);
                });
    }
}
