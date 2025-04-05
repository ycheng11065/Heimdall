package com.application.server.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

// Maps this class to the "satellites" table in the database
@Table("satellites")
public class SatelliteEntity {
    // Marks primary key column
    @Id
    private UUID id;

    @Column("norad_cat_id")
    private int noradCatId;

    @Column("object_name")
    private String objectName;

    @Column("object_type")
    private String objectType;

    @Column("country_code")
    private String countryCode;

    @Column("launch_date")
    private LocalDate launchDate;

    @Column("decay_date")
    private LocalDate decayDate;

    @Column("epoch")
    private LocalDateTime epoch;

    @Column("last_update")
    private LocalDateTime lastUpdate;

    @Column("tle_line1")
    private String tleLine1;

    @Column("tle_line2")
    private String tleLine2;

    @Column("inclination")
    private double inclination;

    @Column("eccentricity")
    private double eccentricity;

    @Column("period")
    private double period;

    @Column("apoapsis")
    private double apoapsis;

    @Column("periapsis")
    private double periapsis;

    @Column("semimajor_axis")
    private double semimajorAxis;

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

    public LocalDateTime getLastUpdate() {
        return lastUpdate;
    }

    public LocalDateTime getEpoch() {
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

    public void setEpoch(LocalDateTime epoch) {
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

    public void setLastUpdate(LocalDateTime lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public void setId(UUID id) {
        this.id = id;
    }
}
