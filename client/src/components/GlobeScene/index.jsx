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
import SpeedControl from '../SpeedControl/index.jsx';
import SatelliteTypeControl from '../SatelliteTypeControl/index.jsx';
import SatelliteInfoBox from '../SatelliteInfoBox/index.jsx';

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

	const canvasRef = useRef(null);
	const sceneRef = useRef(null);

	const selectedSatelliteRef = useRef(null);
	const [selectedSatelliteData, setSelectedSatelliteData] = useState(null);
	const [satelliteType, setSatelliteType] = useState("OneWeb");
	
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
			setupGlobeScene(canvasRef.current, (mesh) => {
				selectedSatelliteRef.current = mesh;
			}).then(async (globeSceneManager) => {
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

		const interval = setInterval(() => {
			const mesh = selectedSatelliteRef.current;
			if (!mesh || !mesh.userData) {
				setSelectedSatelliteData(null);
				return;
			}

			const d = mesh.userData;
			const data = {
				objectName: d.objectName,
				noradCatId: d.noradCatId,
				countryCode: d.countryCode,
				launchDate: d.launchDate,
				decayDate: d.decayDate,
				lastUpdated: d.lastUpdated,
				x: d.x.toFixed(2),
				y: d.y.toFixed(2),
				z: d.z.toFixed(2),
				latitude: d.latitude.toFixed(2),
				longitude: d.longitude.toFixed(2),
				altitude: d.altitude.toFixed(2),
			};

			setSelectedSatelliteData(prev => {
				const hasChanged = !prev || Object.keys(data).some(k => prev[k] !== data[k]);
				return hasChanged ? data : prev;
			});
		}, 300);
		
		return () => {
			window.removeEventListener('resize', handleResize);
			sceneRef.current?.stopAnimationLoop();
			sceneRef.current?.dispose();
			clearInterval(interval);
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

	useEffect(() => {
		if (!sceneReady || !sceneRef.current) {
			return;
		}

		const loadSatellite = async () => {
			await sceneRef.current.satelliteManager.clearSatellites();
			const satelliteDTOs = await fetchSatellitesByType(satelliteType.toLowerCase());
			for (const sat of satelliteDTOs) {
				await sceneRef.current.satelliteManager.addSatellite(sat);
			}
		}

		loadSatellite().catch(err => console.error(err));

	}, [satelliteType])

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
					width: '20rem',
					position: 'absolute',
					top: '16px',
					right: '16px',
					zIndex: 10
				}}>
					<SpeedControl satelliteManager={sceneRef.current.satelliteManager} />
				</div>
			)}

			{sceneReady && (
				<div style={{
					width: '20rem',
					position: 'absolute',
					top: '35px',
					right: '16px',
					zIndex: 10
				}}>
					<SatelliteTypeControl type={satelliteType} setType={setSatelliteType}/>
				</div>
			)}

			{sceneReady && selectedSatelliteData && (
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
					<SatelliteInfoBox satelliteData={selectedSatelliteData} />
				</div>
			)}
		</>
	);
}

export default GlobeScene;
