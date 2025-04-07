package com.application.server.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("earthquakes")
public class EarthquakeEntity {
    @Id
    private UUID id; // Internal unique identifier for the database (primary key)

    @Column("mag")
    private Double mag; // Magnitude of the earthquake

    @Column("place")
    private String place; // Human-readable description of the location (e.g., "10km S of Townsville")

    @Column("time")
    private LocalDateTime time; // Date and time when the earthquake occurred (origin time)

    @Column("updated")
    private LocalDateTime updated; // Timestamp of the last update from USGS for this event

    @Column("tz")
    private int tz; // Timezone offset from UTC in minutes (e.g., -480 for PST)

    @Column("cdi")
    private Double cdi; // Community Determined Intensity (based on user-submitted reports)

    @Column("mmi")
    private Double mmi; // Modified Mercalli Intensity (instrumentally estimated shaking severity)

    @Column("alert")
    private String alert; // Alert level issued by USGS: "green", "yellow", "orange", or "red"

    @Column("status")
    private String status; // Processing status of the event: "automatic" or "reviewed"

    @Column("tsunami")
    private int tsunami; // Indicates tsunami potential: 1 = potential tsunami, 0 = none

    @Column("significance")
    private int significance; // Event significance score (sig), higher = more impactful

    @Column("nst")
    private int nst; // Number of seismic stations used to locate the event

    @Column("dmin")
    private Double dmin; // Horizontal distance to the nearest station in degrees

    @Column("type")
    private String type; // Event type classification, e.g., "earthquake", "explosion", "quarry blast"

    @Column("longitude")
    private Double longitude; // Epicenter longitude in decimal degrees

    @Column("latitude")
    private Double latitude; // Epicenter latitude in decimal degrees

    @Column("depth")
    private Double depth; // Depth of the earthquake in kilometers

    @Column("all_known_ids")
    private String allKnownIds; // Comma-separated list of all known USGS IDs for this event (from `ids` field)

    @Column("earthquake_id")
    private String earthquakeId; // Preferred USGS event ID (from the `id` field in GeoJSON feed)

    @Column("last_updated")
    private LocalDateTime lastUpdated; // Internal timestamp for the last successful sync from USGS

    public void setMag(Double mag) {
        this.mag = mag;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public void setUpdated(LocalDateTime updated) {
        this.updated = updated;
    }

    public void setTz(int tz) {
        this.tz = tz;
    }

    public void setCdi(Double cdi) {
        this.cdi = cdi;
    }

    public void setMmi(Double mmi) {
        this.mmi = mmi;
    }

    public void setAlert(String alert) {
        this.alert = alert;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTsunami(int tsunami) {
        this.tsunami = tsunami;
    }

    public void setSignificance(int significance) {
        this.significance = significance;
    }

    public void setNst(int nst) {
        this.nst = nst;
    }

    public void setDmin(Double dmin) {
        this.dmin = dmin;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setDepth(Double depth) {
        this.depth = depth;
    }

    public void setAllKnownIds(String allKnownIds) {
        this.allKnownIds = allKnownIds;
    }

    public void setEarthquakeId(String earthquakeId) {
        this.earthquakeId = earthquakeId;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
