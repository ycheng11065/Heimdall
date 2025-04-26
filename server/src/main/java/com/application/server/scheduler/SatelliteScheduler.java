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

    // Update every hour and 20 minutes
    @Scheduled(cron = "0 50 * * * *")
    public void refreshSatelliteData() {
        System.out.println("The time has come... Updating satellite data!");

        satelliteService.updateSatelliteData().subscribe();
    }
}