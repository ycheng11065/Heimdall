import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./style.css"; 

const DebugMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="debug-container">

            {/* Toggle Button */}
            <button 
                onClick={toggleMenu}
                className="debug-toggle-btn"
            >
                {/* Simple hamburger/X icon using spans */}
                <div className={'icon-container'}>
                    {isOpen ? <X className="icon" /> : <Menu className="icon" />}
                </div>
            </button>
            
            {/* Debug Menu Panel */}
            {isOpen && (
            <div className="debug-panel">
                <div className="debug-options">
                <p className="debug-option">Debug option 1</p>
                <p className="debug-option">Debug option 2</p>
                </div>
            </div>
            )}

        </div>
    );
};

export default DebugMenu;