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
 * @param {Object} props.debugFloats - Object containing float values for sliders
 * @param {Function} props.setDebugFloats - State setter for updating float values
 * @returns {JSX.Element} The rendered DebugMenu component
 */
const DebugMenu = ({ debugOptions, setDebugOptions, debugFloats, setDebugFloats }) => {
	const [isOpen, setIsOpen] = useState(false);
	
	/**
	 * Toggles the visibility state of the debug menu
	 */
	const toggleMenu = () => setIsOpen(!isOpen);
	
	/**
	 * Toggles the value of a specific debug option
	 * @param {string} optionName - The name of the option to toggle
	 */
	const toggleOption = (optionName) => {
		setDebugOptions({
			...debugOptions,
			[optionName]: !debugOptions[optionName],
		});
	};
	
	/**
	 * Updates a slider value in the debugFloats state
	 * @param {Event} e - The change event from the slider input
	 * @param {string} optionName - The name of the float option to update
	 */
	const handleSliderChange = (e, optionName) => {
		setDebugFloats({
			...debugFloats,
			[optionName]: parseFloat(e.target.value)
		});
	};
	
	/**
	 * Formats a camelCase string to Title Case with spaces
	 * @param {string} str - The camelCase string to format
	 * @returns {string} The formatted string with spaces and proper capitalization
	 */
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
						{Object.entries(debugFloats).map(([option, value]) => (
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
				</div>
			)}
		</div>
	);
};

export default DebugMenu;