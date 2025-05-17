/**
 * @fileoverview DebugMenu is a React component that renders a collapsible menu
 * with toggleable options for testing and debugging purposes. It provides a clean, accessible
 * interface for enabling/disabling various graphical features and adjusting opacity settings.
 * @module DebugMenu
 * @requires react
 * @requires lucide-react
 */
import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./style.css";

/**
 * A React component that displays a toggleable menu with checkbox options
 * and sliders for controlling debug settings and opacity values.
 * 
 * @function DebugMenu
 * @param {Object} props - The component props
 * @param {Object} props.debugOptions - Object containing boolean toggle options
 * @param {Function} props.setDebugOptions - State setter for updating debug options
 * @param {Object} props.sliderFloats - Object containing slider float values for sliders
 * @param {Function} props.setSliderFloats - State setter for updating slider float values
 * @param {Object} props.camera - Camera object with zoom property and addEventListener method
 * @returns {JSX.Element} The rendered DebugMenu component
 */
const DebugMenu = ({ debugOptions, setDebugOptions, sliderFloats, setSliderFloats, camera }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [cameraZoom, setCameraZoom] = useState(camera.zoom);

	camera.addEventListener("zoom", (e) => {
		setCameraZoom(e.zoomLevel);
	});

	const toggleMenu = () => setIsOpen(!isOpen);
	
	const toggleOption = (optionName) => {
		setDebugOptions({
			...debugOptions,
			[optionName]: !debugOptions[optionName],
		});
	};
	
	const handleSliderChange = (e, optionName) => {
		setSliderFloats({
			...sliderFloats,
			[optionName]: parseFloat(e.target.value)
		});
	};
	
	const formatLabel = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
	
	return (
		<div className="debug-container">
			{/* Toggle Button */}
			<button onClick={toggleMenu} className="debug-toggle-btn">
				{isOpen ? <X size={20} /> : <Menu size={20} />}
			</button>
			
			{/* Debug Menu Panel */}
			{isOpen && (
				<div className="debug-panel">
					
					{/* Toggle options section */}
					<div className="debug-section">
						<h3 className="debug-heading">Debug Options</h3>
						{Object.entries(debugOptions).map(([option, value]) => (
							<div key={option} className="debug-row">
								<label className="debug-label">
									<input
										type="checkbox"
										checked={value}
										onChange={() => toggleOption(option)}
									/>
									<span>{formatLabel(option)}</span>
								</label>
							</div>
						))}
					</div>
					
					{/* Sliders section */}
					<div className="debug-section">
						<h3 className="debug-heading">Opacity Controls</h3>
						{Object.entries(sliderFloats).map(([option, value]) => (
							<div key={option} className="debug-row">
								<div className="debug-slider-row">
									<label className="debug-label">{formatLabel(option)}</label>
									<span className="debug-value">{value.toFixed(2)}</span>
								</div>
								<input
									type="range"
									min="0"
									max="1"
									step="0.01"
									value={value}
									onChange={(e) => handleSliderChange(e, option)}
									className="debug-slider"
								/>
							</div>
						))}
					</div>

					{/* Metrics */}
					<div className="debug-section">
						<h3 className="debug-heading">Metrics</h3>
						<p>Zoom: {cameraZoom.toFixed(2)}</p>
						<p></p>
					</div>
				</div>
			)}
		</div>
	);
};

export default DebugMenu;