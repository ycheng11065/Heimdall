const BASE_URL = import.meta.env.VITE_API || "https://localhost:8080/api/satellites";

async function fetchStarlinkSatellites() {
    const res = await fetch(`${BASE_URL}/starlink`)

    if (!res.ok) {
        throw new Error("Failed to fetch Starlink data!");
    }

    return res.json();
}

async function fetchOnewebSatellites() {
    const res = await fetch(`${BASE_URL}/oneweb`)

    if (!res.ok) {
        throw new Error("Failed to fetch OneWeb data!");
    }

    return res.json();
}

async function fetchIridiumSatellites() {
    const res = await fetch(`${BASE_URL}/iridium`)

    if (!res.ok) {
        throw new Error("Failed to fetch Iridium data!");
    }

    return res.json();
}

async function fetchHistoricalSatellites() {
    const res = await fetch(`${BASE_URL}/history`)

    if (!res.ok) {
        throw new Error("Failed to fetch historical data!");
    }

    return res.json();
}

export {
    fetchStarlinkSatellites,
    fetchOnewebSatellites,
    fetchIridiumSatellites
};

