package com.application.server.model.Earthquake;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class EarthquakeFeatureCollection {

    @JsonProperty("features")
    private List<Earthquake> features;

    public List<Earthquake> getFeatures() {
        return features;
    }
    public void setFeatures(List<Earthquake> features) {
        this.features = features;
    }
}
