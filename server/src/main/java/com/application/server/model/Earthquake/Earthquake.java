package com.application.server.model.Earthquake;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Arrays;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Earthquake {

    @JsonProperty("id")
    private String earthquakeId;

    @JsonProperty("properties")
    private Properties properties;

    @JsonProperty("geometry")
    private Geometry geometry;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Properties {
        @JsonProperty("mag")
        private Double mag;

        @JsonProperty("place")
        private String place;

        @JsonProperty("time")
        private Long time;

        @JsonProperty("updated")
        private Long updated;

        @JsonProperty("tz")
        private int tz;

        @JsonProperty("cdi")
        private Double cdi;

        @JsonProperty("mmi")
        private Double mmi;

        @JsonProperty("alert")
        private String alert;

        @JsonProperty("status")
        private String status;

        @JsonProperty("tsunami")
        private int tsunami;

        @JsonProperty("sig")
        private int significance;

        @JsonProperty("nst")
        private int nst;

        @JsonProperty("dmin")
        private Double dmin;

        @JsonProperty("type")
        private String type;

        @JsonProperty("ids")
        private String ids;

        public Double getMag() {
            return mag;
        }

        public String getPlace() {
            return place;
        }

        public Long getTime() {
            return time;
        }

        public Long getUpdated() {
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

        public String getIds() {
            return ids;
        }

        public List<String> getKnowIds() {
            return Arrays.stream(ids.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Geometry {
        @JsonProperty("coordinates")
        private List<Double> coordinates; // [longitude, latitude, depth]

        public Double getLongitude() {
            return coordinates.get(0);
        }

        public Double getLatitude() {
            return coordinates.get(1);
        }

        public Double getDepth() {
            return coordinates.get(2);
        }
    }

    public String getEarthquakeId() {
        return earthquakeId;
    }

    public Properties getProperties() {
        return properties;
    }

    public Geometry getGeometry() {
        return geometry;
    }
}