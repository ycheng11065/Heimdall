export const CAMERA = {
    FOV: 75,                            // field of view
    NEAR: 0.1,                          // min distance clipping
    FAR: 1000,                          // max distance clipping    
    INITIAL_POSITION: [0, 0, 3],
    LOOK_AT: [0, 0, 0],
    CONTROLS: {
        DAMPING: true,                  // inertia damping
        DAMPING_FACTOR: 0.05,
        MIN_DISTANCE: 2,                // zoom min distance
        MAX_DISTANCE: 10,               // zoom max distance
        MIN_POLAR_ANGLE: Math.PI * 0.1, // min angle of the camera
        MAX_POLAR_ANGLE: Math.PI * 0.9  // max angle of the camera
    }
};