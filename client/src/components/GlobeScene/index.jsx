import { useEffect, useRef } from 'react';
import { main } from '../../three/main.js';

function GlobeScene() {
	const canvasRef = useRef(null);

	useEffect(() => {
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
		}}></canvas>
	);
}

export default GlobeScene;