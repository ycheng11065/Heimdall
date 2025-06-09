
const SatelliteInfoBox = ({ satelliteData }) => {

    return(
        <>
            <h4>Selected Satellite</h4>
            <div><b>{satelliteData.objectName}</b></div>
            <div>NORAD ID: {satelliteData.noradCatId}</div>
            <div>Country: {satelliteData.countryCode}</div>
            <div>Launch Date: {satelliteData.launchDate}</div>
            <div>Decay Date: {satelliteData.decayDate}</div>
            <div>Last Updated: {satelliteData.lastUpdated}</div>
            <div>X: {satelliteData.x}</div>
            <div>Y: {satelliteData.y}</div>
            <div>Z: {satelliteData.z}</div>
            <div>Latitude: {satelliteData.latitude}</div>
            <div>Longitude: {satelliteData.longitude}</div>
            <div>Altitude: {satelliteData.altitude}</div>      
        </>
    );
}

export default SatelliteInfoBox;
