package com.application.server.model;

import reactor.core.publisher.Flux;

import java.util.UUID;

public class SatelliteMapper {

    public static SatelliteEntity toEntity(Satellite satellite) {
        SatelliteEntity entity = new SatelliteEntity();

        entity.setNoradCatId(satellite.getNoradCatId());
        entity.setObjectName(satellite.getObjectName());
        entity.setObjectType(satellite.getObjectType());
        entity.setCountryCode(satellite.getCountryCode());
        entity.setLaunchDate(satellite.getLaunchDate());
        entity.setDecayDate(satellite.getDecayDate());
        entity.setEpoch(satellite.getEpoch());
        entity.setTleLine1(satellite.getTleLine1());
        entity.setTleLine2(satellite.getTleLine2());
        entity.setInclination(satellite.getInclination());
        entity.setEccentricity(satellite.getEccentricity());
        entity.setPeriod(satellite.getPeriod());
        entity.setApoapsis(satellite.getApoapsis());
        entity.setPeriapsis(satellite.getPeriapsis());
        entity.setSemimajorAxis(satellite.getSemimajorAxis());
        return entity;
    }
}
