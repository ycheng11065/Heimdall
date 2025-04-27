class ClockManager {
    constructor(speedMultiplier = 30) {
        this.speedMultiplier = speedMultiplier;
        this.simulatedTimeMs = Date.now(); // start at real clock
        this.previousRealTimeMs = Date.now();
    }

    update() {
        const nowRealTimeMs = Date.now();
        const deltaRealMs = nowRealTimeMs - this.previousRealTimeMs;
        this.previousRealTimeMs = nowRealTimeMs;

        this.simulatedTimeMs += deltaRealMs * this.speedMultiplier;
    }

    getSimulatedMinutesSince(epochMs) {
        return (this.simulatedTimeMs - epochMs) / 1000 / 60;
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
    }
}

export default ClockManager;
