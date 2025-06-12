
const SatelliteTypeControl = ({ type, setType }) => {

    const handleChange = (event) => {
        const newSatelliteType = event.target.value;
        setType(newSatelliteType);
    }

    return (
        <div style={{ position: 'absolute', top: '35px', right: '16px', background: '#222', padding: '8px', borderRadius: '8px', color: 'white' }}>
            <label htmlFor="Satellite Select" style={{ marginRight: '8px' }}>Satellite:</label>
            <select id="satelliteSelect" value={type} onChange={handleChange}>
                <option value={"OneWeb"}>OneWeb</option>
                <option value={"Starlink"}>Starlink</option>
                <option value={"Iridium"}>Iridum</option>
            </select>
        </div>
    );
};

export default SatelliteTypeControl;
