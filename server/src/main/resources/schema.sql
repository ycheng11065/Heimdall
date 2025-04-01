CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS satellites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    norad_cat_id INT,
    object_name VARCHAR(100),
    object_type VARCHAR(50),
    country_code VARCHAR(10),
    launch_date DATE,
    decay_date DATE,
    epoch TIMESTAMP,
    tle_line1 TEXT,
    tle_line2 TEXT,
    inclination DOUBLE PRECISION,
    eccentricity DOUBLE PRECISION,
    period DOUBLE PRECISION,
    apoapsis DOUBLE PRECISION,
    periapsis DOUBLE PRECISION,
    semimajor_axis DOUBLE PRECISION
);