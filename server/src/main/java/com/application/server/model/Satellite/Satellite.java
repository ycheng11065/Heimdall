package com.application.server.model.Satellite;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.time.LocalDate;

public class Satellite {
    @JsonProperty("NORAD_CAT_ID")
    private int noradCatId;

    @JsonProperty("OBJECT_NAME")
    private String objectName;

    @JsonProperty("OBJECT_TYPE")
    private String objectType;

    @JsonProperty("COUNTRY_CODE")
    private String countryCode;

    @JsonProperty("LAUNCH_DATE")
    private LocalDate launchDate;

    @JsonProperty("DECAY_DATE")
    private LocalDate decayDate;

    @JsonProperty("EPOCH")
    private String epoch;

    @JsonProperty("TLE_LINE1")
    private String tleLine1;

    @JsonProperty("TLE_LINE2")
    private String tleLine2;

    @JsonProperty("INCLINATION")
    private double inclination;

    @JsonProperty("ECCENTRICITY")
    private double eccentricity;

    @JsonProperty("PERIOD")
    private double period;

    @JsonProperty("APOAPSIS")
    private double apoapsis;

    @JsonProperty("PERIAPSIS")
    private double periapsis;

    @JsonProperty("SEMIMAJOR_AXIS")
    private double semimajorAxis;

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

    public Instant getEpoch() {
        return Instant.parse(epoch + "Z");
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
}
