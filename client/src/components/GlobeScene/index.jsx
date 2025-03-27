/**
 * @fileoverview GlobeScene is a React component that initializes and manages a 3D globe visualization
 * rendered using Three.js.
 * @module GlobeScene
 */

import { useEffect, useRef } from 'react';
import { main } from '../../three/main.js';

/**
 * @function GlobeScene
 * @description A React component that renders a Three.js scene with a 3D globe.
 * The component initializes the Three.js scene and handles window resize events.
 * @returns {JSX.Element} A canvas element where the Three.js scene is rendered.
 */
function GlobeScene() {
    /**
     * Reference to the canvas DOM element where Three.js will render.
     * @type {React.RefObject<HTMLCanvasElement>}
     */
    const canvasRef = useRef(null);

    useEffect(() => {
		if (!canvasRef.current) {
			console.error('Canvas element not found');
			return;
		}
		
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize();

        main(canvasRef.current);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas ref={canvasRef} style={{
            width: '100%',
            height: '100%',
            display: 'block'
        }} />
    );
}

export default GlobeScene;