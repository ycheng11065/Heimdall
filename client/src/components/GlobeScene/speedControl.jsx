import { useState } from 'react';

const SpeedControl = ({ satelliteManager }) => {
    const [speed, setSpeed] = useState(1);

    const handleChange = (event) => {
        const newSpeed = parseFloat(event.target.value);
        setSpeed(newSpeed);

        if (newSpeed === 1) {
            // If going back to real time
            satelliteManager.clock.simulatedTimeMs = Date.now();
            satelliteManager.clock.previousRealTimeMs = Date.now();
        }
    
        satelliteManager.setSpeed(newSpeed);
    };

    return (
        <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#222', padding: '8px', borderRadius: '8px', color: 'white' }}>
            <label htmlFor="speedSelect" style={{ marginRight: '8px' }}>Speed:</label>
            <select id="speedSelect" value={speed} onChange={handleChange}>
                <option value={0}>Paused</option>
                <option value={1}>1x (Real Time)</option>
                <option value={4}>4x</option>
                <option value={8}>8x</option>
                <option value={16}>16x</option>
                <option value={32}>32x</option>
            </select>
        </div>
    );
};

export default SpeedControl;
