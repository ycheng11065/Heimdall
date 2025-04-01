export const CAMERA = {
    FOV: 75,                            // field of view
    NEAR: 0.1,                          // min distance clipping
    FAR: 1000,                          // max distance clipping    
    INITIAL_POSITION: [0, 0, 25],
    LOOK_AT: [0, 0, 0],
    CONTROLS: {
        DAMPING: true,                  // inertia damping
        DAMPING_FACTOR: 0.05,
        MIN_DISTANCE: 10.2,               // zoom min distance
        MAX_DISTANCE: 50,               // zoom max distance
        MIN_POLAR_ANGLE: Math.PI * 0.1, // min angle of the camera
        MAX_POLAR_ANGLE: Math.PI * 0.9  // max angle of the camera
    }
};


export const GEO_FEATURE = {
    COASTLINE: 1,
    RIVERS: 2,
    LAKES: 3,
    OCEANS: 4,
    LAND: 5
};

export const GLOBE = {
    RADIUS: 10,
    SEGMENTS: 64
};