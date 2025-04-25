package com.application.server.model.Satellite;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SatelliteDTO(
        int noradCatId,
        String objectName,
        String countryCode,
        LocalDate launchDate,
        LocalDate decayDate,
        LocalDateTime         String tleLine1,
        String tleLine2
) {}