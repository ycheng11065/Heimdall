
// TEMPORARY until getting it to backend
export async function fetchGeoJSON(file_name) {
    try {
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