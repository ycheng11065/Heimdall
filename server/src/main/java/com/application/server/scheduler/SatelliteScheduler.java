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

    // Update at every hour
//    @Scheduled(cron = "0 20 * * * *")
    @Scheduled(cron = "0 * * * * *")
    public void refreshSatelliteData() {
        System.out.println("The time has come... Updating satellite data!");

        satelliteService.updateSatelliteData().subscribe();
    }
}