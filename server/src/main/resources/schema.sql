CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS satellites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    norad_cat_id INT UNIQUE,
    object_name VARCHAR(100),
    object_type VARCHAR(50),
    country_code VARCHAR(10),
    launch_date DATE,
    decay_date DATE,
    last_updated TIMESTAMPTZ,
    epoch TIMESTAMPTZ,
    tle_line1 TEXT,
    tle_line2 TEXT,
    inclination DOUBLE PRECISION,
    eccentricity DOUBLE PRECISION,
    period DOUBLE PRECISION,
    apoapsis DOUBLE PRECISION,
    periapsis DOUBLE PRECISION,
    semimajor_axis DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS earthquakes (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   magnitude DOUBLE PRECISION,
   location_description VARCHAR(255),
   event_time TIMESTAMPTZ,
   usgs_update_time TIMESTAMPTZ,
   timezone_offset_minutes INT,
   community_intensity_cdi DOUBLE PRECISION,
   mercalli_intensity_mmi DOUBLE PRECISION,
   usgs_alert_level VARCHAR(20),
   processing_status VARCHAR(20),
   tsunami_potential INT,
   event_significance INT,
   station_count INT,
   min_station_distance_deg DOUBLE PRECISION,
   event_type VARCHAR(50),
   epicenter_longitude DOUBLE PRECISION,
   epicenter_latitude DOUBLE PRECISION,
   depth_km DOUBLE PRECISION,
   known_event_ids TEXT,
   preferred_event_id VARCHAR(50) UNIQUE,
   last_updated TIMESTAMPTZ
);