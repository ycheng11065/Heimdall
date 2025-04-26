package com.application.server.model.Earthquake;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class EarthquakeMapper {

    public static EarthquakeEntity toEntity(Earthquake earthquake) {
        EarthquakeEntity entity = new EarthquakeEntity();
        entity.setMagnitude(earthquake.getProperties().getMag());
        entity.setLocation_description(earthquake.getProperties().getPlace());
        entity.setTimezone_offset_minutes(earthquake.getProperties().getTz());
        entity.setCommunity_intensity_cdi(earthquake.getProperties().getCdi());
        entity.setMercalli_intensity_mmi(earthquake.getProperties().getMmi());
        entity.setUsgs_alert_level(earthquake.getProperties().getAlert());
        entity.setProcessing_status(earthquake.getProperties().getStatus());
        entity.setTsunami_potential(earthquake.getProperties().getTsunami());
        entity.setEvent_significance(earthquake.getProperties().getSignificance());
        entity.setStation_count(earthquake.getProperties().getNst());
        entity.setMin_station_distance_deg(earthquake.getProperties().getDmin());
        entity.setEvent_type(earthquake.getProperties().getType());
        entity.setEpicenter_longitude(earthquake.getGeometry().getLongitude());
        entity.setEpicenter_latitude(earthquake.getGeometry().getLatitude());
        entity.setDepth_km(earthquake.getGeometry().getDepth());
        entity.setKnown_event_ids(earthquake.getProperties().getIds());
        entity.setPreferred_event_id(earthquake.getEarthquakeId());
        entity.setLastUpdated(Instant.now());

        Instant eventInstant = Instant.ofEpochMilli(earthquake.getProperties().getTime());
        Instant updateInstant = Instant.ofEpochMilli(earthquake.getProperties().getUpdated());

        entity.setEvent_time(eventInstant);
        entity.setUsgs_update_time(updateInstant);

        return entity;
    }
}
