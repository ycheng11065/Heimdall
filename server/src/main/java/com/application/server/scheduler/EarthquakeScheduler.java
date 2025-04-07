package com.application.server.scheduler;

import com.application.server.service.EarthquakeService;
import com.application.server.service.SatelliteService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EarthquakeScheduler {
    private final EarthquakeService earthquakeService;

    public EarthquakeScheduler(EarthquakeService earthquakeService) {
        this.earthquakeService = earthquakeService;
    }

    // Update every hour and 20 minutes
    @Scheduled(cron = "0 */15 * * * *")
    public void refreshEarthquakeData() {
        System.out.println("The time has come... Updating earthquake data!");

        earthquakeService.RefreshDatabase().subscribe();
    }
}
