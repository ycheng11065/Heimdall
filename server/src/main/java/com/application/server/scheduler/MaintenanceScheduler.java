package com.application.server.scheduler;

import com.application.server.service.MaintenanceService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceScheduler {
    private final MaintenanceService maintenanceService;

    public MaintenanceScheduler(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Schedule database cleanup at midnight every day
    @Scheduled(cron = "0 0 0 * * *")
    public void scheduleDatabaseCleanup() {
        System.out.println("The time has come... to vacuum!");
        maintenanceService
                .runVacuumAnalysis()
                .subscribe();
    }

}
