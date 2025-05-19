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
import { fetchSatellitesByType } from '../../api/satellite.js';
// import { updateSatellites } from '../../visualizations/satellites/satelliteManager.js';
import SpeedControl from './speedControl.jsx';

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
	const [sceneReady, setSceneReady] = useState(false);

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const canvasRef = useRef(null);
	const sceneRef = useRef(null);
	
	const [debugOptions, setDebugOptions] = useState({
		wireFrame: false,
		showGlobe: true,
		showLand: true,
		showLandIndices: false,
		showLakes: true,
		showLakeIndices: false,
		showGlobeAxes: false,
	});

	const [debugFloats, setDebugFloats] = useState({
		globeOpacity: 1.0,
		landOpacity: 1.0,
		lakesOpacity: 1.0
	});

	// TODO
	useEffect(() => {
		function handleMouseMove(event) {
			setMousePos({ x: event.clientX, y: event.clientY });
		}
	
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);


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
			setupGlobeScene(canvasRef.current).then(async (globeSceneManager) => {
				sceneRef.current = globeSceneManager;
				sceneRef.current.startAnimationLoop();

				const satelliteDTOs = await fetchSatellitesByType("oneweb");

				for (const sat of satelliteDTOs) {
					await sceneRef.current.satelliteManager.addSatellite(sat);
				}
	
				sceneRef.current.addUpdateCallback(() => {
					sceneRef.current.satelliteManager.updateSatellites();
				});

				setSceneReady(true);
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
		const { wireFrame, showGlobe, showLand, showLandIndices, showLakes, showLakeIndices, showGlobeAxes } = debugOptions;
		
		wireFrame ? earth.useWireframe() : earth.useSolid();
		showGlobe ? earth.showGlobe() : earth.hideGlobe();
		showLand ? earth.showLand() : earth.hideLand();
		showLakes ? earth.showLakes() : earth.hideLakes();
		showLandIndices ? earth.showLandIndices() : earth.hideLandIndices();
		showLakeIndices ? earth.showLakeIndices() : earth.hideLakeIndices();
		
		if (showGlobeAxes) {
			earth.showDots();
			earth.showAxes();
		} else {
			earth.hideDots();
			earth.hideAxes();
		}

	}, [debugOptions]);

	/**
	 * Updates the opacity of scene elements when debug float values change
	 * Controls transparency of the globe, land masses, and lakes
	 */
	useEffect(() => {
		if (!sceneRef.current) return;

		const earth = sceneRef.current.earth;
		const { globeOpacity, landOpacity, lakesOpacity } = debugFloats;

		earth.setGlobeOpacity(globeOpacity);
		earth.setLandOpacity(landOpacity);
		earth.setLakesOpacity(lakesOpacity);
	}, [debugFloats]);

	return (
		<>
			<canvas ref={canvasRef} style={{
					width: '100%',
					height: '100%',
					display: 'block'
			}} />

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
						debugFloats={debugFloats}
						setDebugFloats={setDebugFloats}
					/>
				</div>
			)}

			{sceneReady && sceneRef.current?.satelliteManager && (
				<div style={{
					position: 'absolute',
					top: '16px',
					right: '16px',
					zIndex: 10
				}}>
					<SpeedControl satelliteManager={sceneRef.current.satelliteManager} />
				</div>
			)}

			{/* {sceneReady && sceneRef.current?.hoveredSatellite && (
				<div style={{
					position: 'absolute',
					left: mousePos.x + 12 + 'px',
					top: mousePos.y + 12 + 'px',
					background: 'rgba(0, 0, 0, 0.7)',
					color: 'white',
					padding: '6px 8px',
					borderRadius: '4px',
					pointerEvents: 'none',
					fontSize: '12px',
					zIndex: 100
				}}>
					Name: {sceneRef.current.hoveredSatellite.objectName}<br />
					ID: {sceneRef.current.hoveredSatellite.noradCatId}<br />
				</div>
			)} */}

			{sceneReady && sceneRef.current?.selectedSatellite && (
				<div style={{
					position: 'absolute',
					bottom: '16px',
					left: '16px',
					background: 'rgba(0,0,0,0.8)',
					color: 'white',
					padding: '8px 10px',
					borderRadius: '4px',
					zIndex: 20
				}}>
					<h4>Selected Satellite</h4>
					<b>{sceneRef.current.selectedSatellite.objectName}</b><br />
					NORAD ID: {sceneRef.current.selectedSatellite.noradCatId}<br />
					Country: {sceneRef.current.selectedSatellite.countryCode}<br />
					Launch Date: {sceneRef.current.selectedSatellite.launchDate}<br />
					Decay Date: {sceneRef.current.selectedSatellite.decayDate}<br />
					Last Updated: {sceneRef.current.selectedSatellite.lastUpdated}<br />
					X: {sceneRef.current.selectedSatellite.x}<br />
					Y: {sceneRef.current.selectedSatellite.y}<br />
					Z: {sceneRef.current.selectedSatellite.z}<br />
				</div>
			)}
		</>
	);
}

export default GlobeScene;
