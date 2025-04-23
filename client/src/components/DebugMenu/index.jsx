/**
 * @fileoverview DebugMenu is a React component that renders a collapsible menu
 * with toggleable options for testing and debugging purposes. It provides a clean, accessible
 * interface for enabling/disabling various graphical for testing and debugging features.
 * @module DebugMenu
 */
import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./style.css"; 


/**
 * @function DebugMenu
 * @description A React component that displays a toggleable menu with checkbox options
 * for controlling graphics settings. The menu can be collapsed or expanded by clicking
 * a button, and each option toggle updates the parent component's state.
 *
 * @param {Object} props - Component props
 * @param {Object} props.debugOptions - An object containing key-value pairs of debug options,
 *                                      where keys are option names and values are boolean states
 * @param {Function} props.setDebugOptions - State setter function to update the debug options
 *                                          in the parent component
 * 
 * @example
 * // Basic usage
 * const [debugOptions, setDebugOptions] = useState({
 *   showWireframe: false,
 *   displayCoordinates: true,
 *   enableLogging: false
 * });
 * 
 * <DebugMenu 
 *   debugOptions={debugOptions} 
 *   setDebugOptions={setDebugOptions} 
 * />
 *
 * @returns {JSX.Element} A collapsible menu with toggle switches for each debug option
 */
const DebugMenu = ({ debugOptions, setDebugOptions }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleOption = (optionName) => {
        setDebugOptions({
            ...debugOptions,
            [optionName]: !debugOptions[optionName],
        });
    };

    return (
        <div className="debug-container">

            {/* Toggle Button */}
            <button 
                onClick={toggleMenu}
                className="debug-toggle-btn"
            >
                <div className={'icon-container'}>
                    {isOpen ? <X className="icon" /> : <Menu className="icon" />}
                </div>
            </button>


            {/* Debug Menu Panel */}
            {isOpen && (
                <div className="debug-panel">
                    <div className="debug-options">

                        {Object.entries(debugOptions).map(([optionName, optionValue]) => (
                            <div key={optionName} className="debug-option">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={optionValue}
                                        onChange={() => toggleOption(optionName)}
                                    />
                                    {/* convert camelCase to spaced words */}
                                    {optionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </label>
                            </div>
                        ))}

                    </div>
                </div>
            )}

        </div>
    );
};

export default DebugMenu;