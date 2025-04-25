
function Menu() {
    const [satellites, setSatellites] = useState([]);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetchStarlinkSatellites()
        .then(setSatellites)
        .catch((err) => {
          console.error(err);
          setError("Failed to load satellite data.");
        });
    }, []);
  
    return (
      <div className="menu">
        <h2>Starlink Satellites</h2>
        {error && <p>{error}</p>}
        <ul>
          {satellites.map((sat) => (
            <li key={sat.noradCatId}>{sat.objectName}</li>
          ))}
        </ul>
      </div>
    );
}
