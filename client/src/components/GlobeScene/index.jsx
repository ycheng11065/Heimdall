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
import { GLOBE } from '../../three/constants.js';

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
	const canvasRef = useRef(null);
	const sceneRef = useRef(null);
	
	const [sceneLoaded, setSceneLoaded] = useState(false);

	const [debugOptions, setDebugOptions] = useState({
		wireFrame: false,
		showGlobe: true,
		showLand: true,
		showLandIndices: false,
	});

	const [sliderFloats, setSliderFloats] = useState({
		globeOpacity: 1.0,
		landOpacity: 1.0,
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

				sceneRef.current.camera.addEventListener('zoom', (e) => {handleZoomChange(e.zoomLevel)});

				sceneRef.current.startAnimationLoop();
				setSceneLoaded(true);
			});
		}
		
		return () => {
			window.removeEventListener('resize', handleResize);
			sceneRef.current?.stopAnimationLoop();
			sceneRef.current?.dispose();
		};
	}, []);

	useEffect(() => {
		if (!sceneRef.current) return;
		
		const earth = sceneRef.current.earth;
		const { wireFrame, showGlobe, showLand, showLandIndices } = debugOptions;
		
		wireFrame ? earth.useWireframe() : earth.useSolid();
		showGlobe ? earth.showGlobe() : earth.hideGlobe();
		showLand ? earth.showLand() : earth.hideLand();
		showLandIndices ? earth.showLandIndices() : earth.hideLandIndices();
	}, [debugOptions]);

	useEffect(() => {
		if (!sceneRef.current) return;

		const earth = sceneRef.current.earth;
		const { globeOpacity, landOpacity } = sliderFloats;

		earth.setGlobeOpacity(globeOpacity);
		earth.setLandOpacity(landOpacity);
	}, [sliderFloats]);

	const handleZoomChange = (zoomLevel) => {
		if (zoomLevel > 30.0) {
			sceneRef.current?.earth.setScale(GLOBE.SCALES.S110M);
		} else if (zoomLevel > 15.0) {
			sceneRef.current?.earth.setScale(GLOBE.SCALES.S50M);
		}  else {
			sceneRef.current?.earth.setScale(GLOBE.SCALES.S10M);
		}
	}

	return (
		<>
			{/* Debug menu - conditionally rendered based on enableDebugMenu prop */}
			{enableDebugMenu && sceneLoaded && (
				<div style={{
					position: 'absolute',
					top: '16px',
					left: '16px',
					zIndex: 10 // ensure the debug menu is above the canvas
				}}>
					<DebugMenu
						debugOptions={debugOptions}
						setDebugOptions={setDebugOptions}
						sliderFloats={sliderFloats}
						setSliderFloats={setSliderFloats}
						camera={sceneRef.current?.camera} // pass camera reference if available
					/>
				</div>
			)}
			
			<canvas ref={canvasRef} style={{
				width: '100%',
				height: '100%',
				display: 'block'
			}} />
		</>
	);
}

export default GlobeScene;