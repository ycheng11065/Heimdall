package com.application.server.model.Earthquake;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("earthquakes")
public class EarthquakeEntity {
    @Id
    private UUID id; // Internal unique identifier for the database (primary key)

    @Column("magnitude")
    private Double magnitude; // Magnitude of the earthquake

    @Column("location_description")
    private String location_description; // Human-readable description of the location (e.g., "10km S of Townsville")

    @Column("event_time")
    private Instant event_time; // Date and time when the earthquake occurred (origin time)

    @Column("usgs_update_time")
    private Instant usgs_update_time; // Timestamp of the last update from USGS for this event

    @Column("timezone_offset_minutes")
    private int timezone_offset_minutes; // Timezone offset from UTC in minutes (e.g., -480 for PST)

    @Column("community_intensity_cdi")
    private Double community_intensity_cdi; // Community Determined Intensity (based on user-submitted reports)

    @Column("mercalli_intensity_mmi")
    private Double mercalli_intensity_mmi; // Modified Mercalli Intensity (instrumentally estimated shaking severity)

    @Column("usgs_alert_level")
    private String usgs_alert_level; // Alert level issued by USGS: "green", "yellow", "orange", or "red"

    @Column("processing_status")
    private String processing_status; // Processing status of the event: "automatic" or "reviewed"

    @Column("tsunami_potential")
    private int tsunami_potential; // Indicates tsunami potential: 1 = potential tsunami, 0 = none

    @Column("event_significance")
    private int event_significance; // Event significance score (sig), higher = more impactful

    @Column("station_count")
    private int station_count; // Number of seismic stations used to locate the event

    @Column("min_station_distance_deg")
    private Double min_station_distance_deg; // Horizontal distance to the nearest station in degrees

    @Column("event_type")
    private String event_type; // Event type classification, e.g., "earthquake", "explosion", "quarry blast"

    @Column("epicenter_longitude")
    private Double epicenter_longitude; // Epicenter longitude in decimal degrees

    @Column("epicenter_latitude")
    private Double epicenter_latitude; // Epicenter latitude in decimal degrees

    @Column("depth_km")
    private Double depth_km; // Depth of the earthquake in kilometers

    @Column("known_event_ids")
    private String known_event_ids; // Comma-separated list of all known USGS IDs for this event (from `ids` field)

    @Column("preferred_event_id")
    private String preferred_event_id; // Preferred USGS event ID (from the `id` field in GeoJSON feed)

    @Column("last_updated")
    private Instant lastUpdated; // Internal timestamp for the last successful sync from USGS

    public UUID getId() {
        return id;
    }

    public Double getMagnitude() {
        return magnitude;
    }

    public String getLocation_description() {
        return location_description;
    }

    public Instant getEvent_time() {
        return event_time;
    }

    public  Instant getUsgs_update_time() {
        return usgs_update_time;
    }

    public int getTimezone_offset_minutes() {
        return timezone_offset_minutes;
    }

    public Double getCommunity_intensity_cdi() {
        return community_intensity_cdi;
    }

    public Double getMercalli_intensity_mmi() {
        return mercalli_intensity_mmi;
    }

    public String getUsgs_alert_level() {
        return usgs_alert_level;
    }

    public String getProcessing_status() {
        return processing_status;
    }

    public int getTsunami_potential() {
        return tsunami_potential;
    }

    public int getEvent_significance() {
        return event_significance;
    }

    public int getStation_count() {
        return station_count;
    }

    public Double getMin_station_distance_deg() {
        return min_station_distance_deg;
    }

    public String getEvent_type() {
        return event_type;
    }

    public Double getEpicenter_longitude() {
        return epicenter_longitude;
    }

    public Double getEpicenter_latitude() {
        return epicenter_latitude;
    }

    public Double getDepth_km() {
        return depth_km;
    }

    public String getKnown_event_ids() {
        return known_event_ids;
    }

    public String getPreferred_event_id() {
        return preferred_event_id;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setMagnitude(Double magnitude) {
        this.magnitude = magnitude;
    }

    public void setLocation_description(String location_description) {
        this.location_description = location_description;
    }

    public void setEvent_time(Instant event_time) {
        this.event_time = event_time;
    }

    public void setUsgs_update_time(Instant usgs_update_time) {
        this.usgs_update_time = usgs_update_time;
    }

    public void setTimezone_offset_minutes(int timezone_offset_minutes) {
        this.timezone_offset_minutes = timezone_offset_minutes;
    }

    public void setCommunity_intensity_cdi(Double community_intensity_cdi) {
        this.community_intensity_cdi = community_intensity_cdi;
    }

    public void setMercalli_intensity_mmi(Double mercalli_intensity_mmi) {
        this.mercalli_intensity_mmi = mercalli_intensity_mmi;
    }

    public void setUsgs_alert_level(String usgs_alert_level) {
        this.usgs_alert_level = usgs_alert_level;
    }

    public void setProcessing_status(String processing_status) {
        this.processing_status = processing_status;
    }

    public void setTsunami_potential(int tsunami_potential) {
        this.tsunami_potential = tsunami_potential;
    }

    public void setEvent_significance(int event_significance) {
        this.event_significance = event_significance;
    }

    public void setStation_count(int station_count) {
        this.station_count = station_count;
    }

    public void setMin_station_distance_deg(Double min_station_distance_deg) {
        this.min_station_distance_deg = min_station_distance_deg;
    }

    public void setEvent_type(String event_type) {
        this.event_type = event_type;
    }

    public void setEpicenter_longitude(Double epicenter_longitude) {
        this.epicenter_longitude = epicenter_longitude;
    }

    public void setEpicenter_latitude(Double epicenter_latitude) {
        this.epicenter_latitude = epicenter_latitude;
    }

    public void setDepth_km(Double depth_km) {
        this.depth_km = depth_km;
    }

    public void setKnown_event_ids(String known_event_ids) {
        this.known_event_ids = known_event_ids;
    }

    public void setPreferred_event_id(String preferred_event_id) {
        this.preferred_event_id = preferred_event_id;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
