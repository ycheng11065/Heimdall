import shp from 'shpjs';


const coastline = async () => {
    const response = await fetch('../assets/coastlines/line.shp');
    const arrayBuffer = await response.arrayBuffer();
    const geojson = await shp(arrayBuffer);
    return geojson;
}