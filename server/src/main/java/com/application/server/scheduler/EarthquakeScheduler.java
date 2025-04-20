package com.application.server.scheduler;

import com.application.server.service.EarthquakeService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EarthquakeScheduler {
    private final EarthquakeService earthquakeService;

    public EarthquakeScheduler(EarthquakeService earthquakeService) {
        this.earthquakeService = earthquakeService;
    }

    // Update earthquake data every 5 minutes
    @Scheduled(cron = "0 */5 * * * *")
    public void syncEarthquakeData() {
        System.out.println("The time has come... Updating earthquake data!");

        earthquakeService.syncEarthquakeData().subscribe();
    }

    // Schedule earthquake cleanup at midnight every day
    @Scheduled(cron = "0 0 0 * * *")
    public void cleanupEarthquakeData() {
        System.out.println("The time has come... Deleting old earthquake data!");

        earthquakeService.cleanupEarthquakeData().subscribe();
    }
}
