// const BASE_URL = import.meta.env.VITE_API || "http://backend:8080/api/satellites";
const BASE_URL = import.meta.env.VITE_API || "http://164.92.71.246:8080/api/satellites";

async function fetchSatellitesByType(type) {
    const res = await fetch(`${BASE_URL}/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type} data!`);
    return res.json();
  }
  
export { fetchSatellitesByType };

