/**
 * @fileoverview GlobeScene is a React component that initializes and manages a 3D globe visualization
 * rendered using Three.js. It provides a canvas element for rendering the globe and an optional debug menu.
 * @module GlobeScene
 * @requires react
 * @requires ../../three/globeSceneCore.js
 * @requires ../DebugMenu/index.jsx
 */
import { useEffect, useRef, useState } from 'react';
import { setupGlobeScene } from '../../three/globeSceneCore.js';
import DebugMenu from '../DebugMenu/index.jsx';

/**
 * A React component that renders a Three.js scene with a 3D globe.
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
	/**
	 * Reference to the canvas DOM element where Three.js renders
	 * @type {React.RefObject<HTMLCanvasElement>}
	 */
	const canvasRef = useRef(null);
	
	/**
	 * Reference to the globe scene manager instance
	 * @type {React.RefObject<Object>}
	 */
	const sceneRef = useRef(null);
	
	/**
	 * Debug options state for controlling scene features
	 * @type {Object}
	 * @property {boolean} wireFrame - Whether to render in wireframe mode
	 * @property {boolean} showGlobe - Whether to show the base globe
	 * @property {boolean} showLand - Whether to show land masses
	 * @property {boolean} showLandIndices - Whether to show debug indices for land
	 * @property {boolean} showLakes - Whether to show lakes
	 * @property {boolean} showLakeIndices - Whether to show debug indices for lakes
	 */
	const [debugOptions, setDebugOptions] = useState({
		wireFrame: false,
		showGlobe: true,
		showLand: true,
		showLandIndices: false,
		showLakes: true,
		showLakeIndices: false
	});

	/**
	 * Initialize the Three.js scene when the component mounts
	 * Sets up the canvas, handles window resizing, and manages the animation loop
	 */
	useEffect(() => {
		if (!canvasRef.current) {
			console.error('Canvas element not found');
			return;
		}
		
		/**
		 * Updates canvas dimensions when window is resized
		 */
		const handleResize = () => {
			if (canvasRef.current) {
				canvasRef.current.width = window.innerWidth;
				canvasRef.current.height = window.innerHeight;
			}
		}
		
		window.addEventListener('resize', handleResize);
		handleResize();
		
		if (!sceneRef.current) {
			setupGlobeScene(canvasRef.current).then((globeSceneManager) => {
				sceneRef.current = globeSceneManager;
				sceneRef.current.startAnimationLoop();
			});
		}
		
		return () => {
			window.removeEventListener('resize', handleResize);
			sceneRef.current?.stopAnimationLoop();
            sceneRef.current?.dispose();
		};
	}, []);

	/**
	 * Updates the scene when debug options change
	 * Controls visibility and rendering modes of globe elements
	 */
	useEffect(() => {
		if (!sceneRef.current) return;
		
		const earth = sceneRef.current.earth;
		const { wireFrame, showGlobe, showLand, showLandIndices, showLakes, showLakeIndices } = debugOptions;
		
		wireFrame ? earth.useWireframe() : earth.useSolid();
		showGlobe ? earth.showGlobe() : earth.hideGlobe();
		showLand ? earth.showLand() : earth.hideLand();
		showLakes ? earth.showLakes() : earth.hideLakes();
		showLandIndices ? earth.showLandIndices() : earth.hideLandIndices();
		showLakeIndices ? earth.showLakeIndices() : earth.hideLakeIndices();
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