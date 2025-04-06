package com.application.server.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("earthquake")
public class EarthquakeEntity {
    @Id
    private UUID id; // Internal unique identifier for the database (primary key)

    private Double mag; // Magnitude of the earthquake
    private String place; // Human-readable description of the location (e.g., "10km S of Townsville")
    private LocalDateTime time; // Date and time when the earthquake occurred (origin time)
    private LocalDateTime updated; // Timestamp of the last update from USGS for this event

    private int tz; // Timezone offset from UTC in minutes (e.g., -480 for PST)

    private Double cdi; // Community Determined Intensity (based on user-submitted reports)
    private Double mmi; // Modified Mercalli Intensity (instrumentally estimated shaking severity)
    private String alert; // Alert level issued by USGS: "green", "yellow", "orange", or "red"

    private String status; // Processing status of the event: "automatic" or "reviewed"

    private int tsunami; // Indicates tsunami potential: 1 = potential tsunami, 0 = none
    private int significance; // Event significance score (sig), higher = more impactful
    private int nst; // Number of seismic stations used to locate the event
    private double dmin; // Horizontal distance to the nearest station in degrees

    private String type; // Event type classification, e.g., "earthquake", "explosion", "quarry blast"

    private Double longitude; // Epicenter longitude in decimal degrees
    private Double latitude; // Epicenter latitude in decimal degrees
    private Double depth; // Depth of the earthquake in kilometers

    private String allKnownIds; // Comma-separated list of all known USGS IDs for this event (from `ids` field)
    private String earthquakeId; // Preferred USGS event ID (from the `id` field in GeoJSON feed)

    private LocalDateTime lastUpdated; // Internal timestamp for the last successful sync from USGS
}
