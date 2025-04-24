/**
 * @fileoverview GlobeScene is a React component that initializes and manages a 3D globe visualization
 * rendered using Three.js. It provides a canvas element for rendering the globe and an optional debug menu.
 * @module GlobeScene
 */

import { useEffect, useRef, useState } from 'react';
import { setupGlobeScene } from '../../three/globeSceneCore.js';
import DebugMenu from '../DebugMenu/index.jsx';

/**
 * @function GlobeScene
 * @description A React component that renders a Three.js scene with a 3D globe.
 * The component initializes the Three.js scene, handles window resize events, and
 * provides an optional debug menu for development purposes.
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.enableDebugMenu=false] - When true, displays a debug menu overlay
 * for manipulating the globe's properties during development
 * 
 * @example
 * // Basic usage
 * <GlobeScene />
 * 
 * @example
 * // With debug menu enabled
 * <GlobeScene enableDebugMenu={true} />
 * 
 * @returns {JSX.Element} A canvas element where the Three.js scene is rendered, optionally with a debug menu
 */
const GlobeScene = ({ enableDebugMenu = false }) => {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);

    const [debugOptions, setDebugOptions] = useState({
        wireFrame: false,
        showIndices: false,
        showGlobe: true,
        showLand: true,
        showLakes: true,
        showRivers: true,
    });

    // Initialize the Three.js scene when the component mounts
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
        
        setupGlobeScene(canvasRef.current).then((globeSceneManager) => {
            sceneRef.current = globeSceneManager;
            sceneRef.current.startAnimationLoop();
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            sceneRef.current?.stopAnimationLoop();
        };
    }, []);


    // Update the scene when debug options change
    useEffect(() => {
        if (sceneRef.current) {
            // eslint-disable-next-line no-unused-vars
            const { wireFrame, showIndices, showGlobe, showLand, showLakes, showRivers } = debugOptions;

            sceneRef.current.earth.setWireframe(wireFrame);
        }
    }, [debugOptions]);


    return (
        <>
            {/* Debug menu - conditionally rendered based on enableDebugMenu prop */}
            {enableDebugMenu && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 10 // ensure the debug menu is above the canvas
                }}>

                    <DebugMenu 
                        debugOptions={debugOptions} 
                        setDebugOptions={setDebugOptions} 
                    />

                </div>
            )}
            



            {/* Canvas for Three.js rendering */}
            <canvas ref={canvasRef} style={{
                width: '100%',
                height: '100%',
                display: 'block'
            }} />
        </>
    );
}

export default GlobeScene;