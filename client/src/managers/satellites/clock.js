class ClockManager {
    constructor(speedMultiplier = 30) {
        this.speedMultiplier = speedMultiplier;
        this.simulatedTime = Date.now(); 
        this.previousRealTime = Date.now();
    }

    update() {
        const nowRealTime = Date.now();
        const deltaReal = nowRealTime - this.previousRealTime;
        this.previousRealTime = nowRealTime;

        this.simulatedTime += deltaReal * this.speedMultiplier;
    }

    getSimulatedMinutesSince(epoch) {
        return (this.simulatedTime - epoch) / 1000 / 60;
    }

    getSimulatedDate() {
        return new Date(this.simulatedTime);
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
    }
}

export default ClockManager;
