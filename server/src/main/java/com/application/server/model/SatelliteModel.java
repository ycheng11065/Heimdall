package com.application.server.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;

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
    private OffsetDateTime epoch;

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
}
