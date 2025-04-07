package com.application.server.model;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class EarthquakeMapper {

    public static EarthquakeEntity toEntity(Earthquake earthquake) {
        EarthquakeEntity entity = new EarthquakeEntity();
        entity.setMag(earthquake.getProperties().getMag());
        entity.setPlace(earthquake.getProperties().getPlace());
        entity.setTz(earthquake.getProperties().getTz());
        entity.setCdi(earthquake.getProperties().getCdi());
        entity.setMmi(earthquake.getProperties().getMmi());
        entity.setAlert(earthquake.getProperties().getAlert());
        entity.setStatus(earthquake.getProperties().getStatus());
        entity.setTsunami(earthquake.getProperties().getTsunami());
        entity.setSignificance(earthquake.getProperties().getSignificance());
        entity.setNst(earthquake.getProperties().getNst());
        entity.setDmin(earthquake.getProperties().getDmin());
        entity.setType(earthquake.getProperties().getType());
        entity.setLongitude(earthquake.getGeometry().getLongitude());
        entity.setLatitude(earthquake.getGeometry().getLatitude());
        entity.setDepth(earthquake.getGeometry().getDepth());
        entity.setAllKnownIds(earthquake.getProperties().getIds());
        entity.setEarthquakeId(earthquake.getEarthquakeId());
        entity.setLastUpdated(LocalDateTime.now());

        LocalDateTime localTime = Instant.ofEpochMilli(earthquake.getProperties().getTime())
                .atZone(ZoneId.systemDefault()) // Use computer/server’s zone
                .toLocalDateTime();

        LocalDateTime localUpdated = Instant.ofEpochMilli(earthquake.getProperties().getUpdated())
                .atZone(ZoneId.systemDefault()) // Use computer/server’s zone
                .toLocalDateTime();

        entity.setTime(localTime);
        entity.setTime(localUpdated);

        return entity;
    }
}
