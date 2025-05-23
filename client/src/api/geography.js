import { GLOBE } from "../three/constants";
// TEMPORARY until getting it to backend

export async function fetchLandGeoJSON(scale) {
    try {
        let file_name;
        switch (scale) {
            case GLOBE.SCALES.S110M:
                file_name = 'ne_110m_land';
                break;
            case GLOBE.SCALES.S50M:
                file_name = 'ne_50m_land';
                break;
            case GLOBE.SCALES.S10M:
                file_name = 'ne_10m_land';
                break; 
            default:
                throw new Error('Invalid scale provided');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${file_name}/${file_name}.geojson`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('GeoJSON fetch failed:', error);
        throw error;
    }
}