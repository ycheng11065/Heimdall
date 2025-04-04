package com.application.server.scheduler;

import com.application.server.service.SatelliteService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SatelliteScheduler {
    private final SatelliteService satelliteService;

    public SatelliteScheduler(SatelliteService satelliteService) {
        this.satelliteService = satelliteService;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void refreshSatelliteData() {
        System.out.println("The time has come... Updating satellite data!");

        satelliteService.getAllSatelliteData()
                .flatMap(satelliteService::updateSatelliteData)
                .doOnNext(updated -> System.out.println("Updated: " + updated.getObjectName()))
                .doOnError(err -> System.err.println("Update error: " + err.getMessage()))
                .doOnComplete(() -> System.out.println("Satellite data update complete!"))
                .subscribe();
    }
}