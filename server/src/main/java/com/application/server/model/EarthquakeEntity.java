package com.application.server.model;

import org.springframework.cglib.core.Local;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("earthquake")
public class EarthquakeEntity {
    @Id
    private UUID id;
    private Double mag;
    private String place;
    private LocalDateTime time;
    private LocalDateTime updated;
    private int tz;
    private Double cdi;              // Community Intensity
    private Double mmi;              // Modified Mercalli Intensity
    private String alert;       // green/yellow/orange/red
    private String status;           // "automatic" or "reviewed"
    private int tsunami;         // 1 = tsunami potential, 0 = none
    private int significance;        // sig
    private int nst;                 // number of seismic stations
    private double dmin;             // distance to nearest station
    private String type;             // "earthquake", "quarry blast", etc.
    private Double longitude;
    private Double latitude;
    private Double depth;
    private String earthquakeId;
    private LocalDateTime lastUpdated; // internal timestamp for sync
}
