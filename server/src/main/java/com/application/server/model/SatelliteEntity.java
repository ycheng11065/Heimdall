package com.application.server.model;

import org.springframework.data.annotation.Id;
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

    private int noradCatId;
    private String objectName;
    private String objectType;
    private String countryCode;
    private LocalDate launchDate;
    private LocalDate decayDate;
    private LocalDateTime epoch;
    private String tleLine1;
    private String tleLine2;
    private double inclination;
    private double eccentricity;
    private double period;
    private double apoapsis;
    private double periapsis;
    private double semimajorAxis;

    public UUID getId() {
        return id;
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

    public void setId(UUID id) {
        this.id = id;
    }
}
