import { useEffect } from 'react';
import { main } from '../../three/main.js';

function GlobeScene() {
  useEffect(() => {
    main();
  }, []);

  return (
    <canvas id="c" style={{width: window.innerWidth, height: window.innerHeight}}></canvas>
  );
}

export default GlobeScene;