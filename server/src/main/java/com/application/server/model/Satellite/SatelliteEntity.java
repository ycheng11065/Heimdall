package com.application.server.model.Satellite;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

// Maps this class to the "satellites" table in the database
@Table("satellites")
public class SatelliteEntity {
    // Marks primary key column
    @Id
    private UUID id;  // Internal unique identifier for the database (primary key)

    @Column("norad_cat_id")
    private int noradCatId; // Unique NORAD Catalog ID for the satellite

    @Column("object_name")
    private String objectName; // Satellite name or mission name (e.g., "ISS", "STARLINK-3000")

    @Column("object_type")
    private String objectType; // Type of object, e.g., "PAYLOAD", "ROCKET BODY", or "DEBRIS"

    @Column("country_code")
    private String countryCode; // Country responsible for the object (ISO country code)

    @Column("launch_date")
    private LocalDate launchDate; // Date the satellite was launched into orbit

    @Column("decay_date")
    private LocalDate decayDate; // Date the satellite decayed or deorbited (null if still active)

    @Column("epoch")
    private Instant epoch; // Timestamp of the TLE data epoch (reference time for orbit)

    @Column("last_update")
    private Instant lastUpdated; // Timestamp of the last update in the local database

    @Column("tle_line1")
    private String tleLine1; // First line of the satellite's TLE (Two-Line Element set)

    @Column("tle_line2")
    private String tleLine2; // Second line of the satellite's TLE (Two-Line Element set)

    @Column("inclination")
    private double inclination; // Orbit inclination in degrees (angle relative to Earth's equator)

    @Column("eccentricity")
    private double eccentricity; // Orbit eccentricity (0 = circular, closer to 1 = more elliptical)

    @Column("period")
    private double period; // Orbital period in minutes (how long it takes to complete one orbit)

    @Column("apoapsis")
    private double apoapsis; // Farthest point from Earth in the satellite’s orbit (in kilometers)

    @Column("periapsis")
    private double periapsis; // Closest point to Earth in the satellite’s orbit (in kilometers)

    @Column("semimajor_axis")
    private double semimajorAxis; // Average distance from Earth (in kilometers); half the major axis of the orbit

    public UUID getId() {
        return id;
    }

    public int getNoradCatId() {
        return noradCatId;
    }

    public String getObjectName() {
        return objectName;
    }

    public String getObjectType() {
        return objectType;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public LocalDate getLaunchDate() {
        return launchDate;
    }

    public LocalDate getDecayDate() {
        return decayDate;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public Instant getEpoch() {
        return epoch;
    }

    public String getTleLine1() {
        return tleLine1;
    }

    public String getTleLine2() {
        return tleLine2;
    }

    public double getInclination() {
        return inclination;
    }

    public double getEccentricity() {
        return eccentricity;
    }

    public double getPeriod() {
        return period;
    }

    public double getApoapsis() {
        return apoapsis;
    }

    public double getPeriapsis() {
        return periapsis;
    }

    public double getSemimajorAxis() {
        return semimajorAxis;
    }

    public void setSemimajorAxis(double semimajorAxis) {
        this.semimajorAxis = semimajorAxis;
    }

    public void setPeriapsis(double periapsis) {
        this.periapsis = periapsis;
    }

    public void setApoapsis(double apoapsis) {
        this.apoapsis = apoapsis;
    }

    public void setPeriod(double period) {
        this.period = period;
    }

    public void setEccentricity(double eccentricity) {
        this.eccentricity = eccentricity;
    }

    public void setInclination(double inclination) {
        this.inclination = inclination;
    }

    public void setTleLine2(String tleLine2) {
        this.tleLine2 = tleLine2;
    }

    public void setTleLine1(String tleLine1) {
        this.tleLine1 = tleLine1;
    }

    public void setEpoch(Instant epoch) {
        this.epoch = epoch;
    }

    public void setDecayDate(LocalDate decayDate) {
        this.decayDate = decayDate;
    }

    public void setLaunchDate(LocalDate launchDate) {
        this.launchDate = launchDate;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public void setObjectType(String objectType) {
        this.objectType = objectType;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public void setNoradCatId(int noradCatId) {
        this.noradCatId = noradCatId;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public void setId(UUID id) {
        this.id = id;
    }
}
