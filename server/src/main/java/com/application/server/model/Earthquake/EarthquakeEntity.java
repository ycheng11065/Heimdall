package com.application.server.model.Earthquake;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("earthquakes")
public class EarthquakeEntity {
    @Id
    private UUID id; // Internal unique identifier for the database (primary key)

    @Column("magnitude")
    private Double mag; // Magnitude of the earthquake

    @Column("location_description")
    private String place; // Human-readable description of the location (e.g., "10km S of Townsville")

    @Column("event_time")
    private LocalDateTime time; // Date and time when the earthquake occurred (origin time)

    @Column("usgs_update_time")
    private LocalDateTime updated; // Timestamp of the last update from USGS for this event

    @Column("timezone_offset_minutes")
    private int tz; // Timezone offset from UTC in minutes (e.g., -480 for PST)

    @Column("community_intensity_cdi")
    private Double cdi; // Community Determined Intensity (based on user-submitted reports)

    @Column("mercalli_intensity_mmi")
    private Double mmi; // Modified Mercalli Intensity (instrumentally estimated shaking severity)

    @Column("usgs_alert_level")
    private String alert; // Alert level issued by USGS: "green", "yellow", "orange", or "red"

    @Column("processing_status")
    private String status; // Processing status of the event: "automatic" or "reviewed"

    @Column("tsunami_potential")
    private int tsunami; // Indicates tsunami potential: 1 = potential tsunami, 0 = none

    @Column("event_significance")
    private int significance; // Event significance score (sig), higher = more impactful

    @Column("station_count")
    private int nst; // Number of seismic stations used to locate the event

    @Column("min_station_distance_deg")
    private Double dmin; // Horizontal distance to the nearest station in degrees

    @Column("event_type")
    private String type; // Event type classification, e.g., "earthquake", "explosion", "quarry blast"

    @Column("epicenter_longitude")
    private Double longitude; // Epicenter longitude in decimal degrees

    @Column("epicenter_latitude")
    private Double latitude; // Epicenter latitude in decimal degrees

    @Column("depth_km")
    private Double depth; // Depth of the earthquake in kilometers

    @Column("known_event_ids")
    private String allKnownIds; // Comma-separated list of all known USGS IDs for this event (from `ids` field)

    @Column("preferred_event_id")
    private String earthquakeId; // Preferred USGS event ID (from the `id` field in GeoJSON feed)

    @Column("last_updated")
    private LocalDateTime lastUpdate; // Internal timestamp for the last successful sync from USGS

    public UUID getId() {
        return id;
    }

    public Double getMag() {
        return mag;
    }

    public String getPlace() {
        return place;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public LocalDateTime getUpdated() {
        return updated;
    }

    public int getTz() {
        return tz;
    }

    public Double getCdi() {
        return cdi;
    }

    public Double getMmi() {
        return mmi;
    }

    public String getAlert() {
        return alert;
    }

    public String getStatus() {
        return status;
    }

    public int getTsunami() {
        return tsunami;
    }

    public int getSignificance() {
        return significance;
    }

    public int getNst() {
        return nst;
    }

    public Double getDmin() {
        return dmin;
    }

    public String getType() {
        return type;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getDepth() {
        return depth;
    }

    public String getAllKnownIds() {
        return allKnownIds;
    }

    public String getEarthquakeId() {
        return earthquakeId;
    }

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

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

    public void setLastUpdate(LocalDateTime lastUpdated) {
        this.lastUpdate = lastUpdated;
    }
}
