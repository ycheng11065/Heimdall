use std::f64::consts::PI;
use geojson::{Feature, GeoJson, Geometry, PolygonType, Value};


pub fn handle_polygon_feature(geojson_feature: &str) -> Result<(), String> {

    let geojson: GeoJson = geojson_feature.parse::<GeoJson>()
        .map_err(|err| format!("Failed to parse GeoJSON: {}", err))?;
    
    let feature: Feature = Feature::try_from(geojson)
        .map_err(|err| format!("Failed to convert to Feature: {}", err))?;

    let geometry: Geometry = feature.geometry
        .ok_or("Geometry is missing from feature".to_string())?;

    let polygon: PolygonType = match geometry.value {
        Value::Polygon(polygon) => polygon,
        _ => return Err("Expected a polygon".to_string())
    };

    if polygon.is_empty() { return Err("Polygon is empty".to_string()); }


    for (i, ring) in polygon.iter().enumerate() {
        for (j, pos) in ring.iter().enumerate() {
            
        }
    }
    
    Ok(())
}



/// Generates evenly distributed points on a unit sphere using the Fibonacci spiral method.
///
/// # Arguments
///
/// * `n` - Number of points to generate (must be > 0)
///
/// # Returns
///
/// * `Result<Vec<(f64, f64, f64)>, String>` - Vector of 3D points on the unit sphere
///
/// # Errors
///
/// Returns error with descriptive message if `n` is 0 or if division by zero would occur.
///
/// # Example
///
/// ```
/// use spherekit::fibonacci_sphere;
/// 
/// let points = fibonacci_sphere(100).unwrap();
/// for (x, y, z) in points {
///     println!("Point: ({}, {}, {})", x, y, z);
/// }
/// ```
pub fn fibonacci_sphere(n: usize) -> Result<Vec<(f64, f64, f64)>, String> {
    if n == 0 {
        return Err("Cannot generate zero points".to_string());
    }

    let phi: f64 = PI * (5.0_f64.sqrt() - 1.0);
    let mut points: Vec<(f64, f64, f64)> = Vec::with_capacity(n);
    let denominator: f64 = if n > 1 { n as f64 - 1.0 } else { 1.0 };

    if denominator.abs() < f64::EPSILON {
        return Err("Division by zero error in calculation".to_string());
    }

    for i in 0..n {
        let y: f64 = 1.0 - (i as f64 / denominator) * 2.0;

        let radius: f64 = (1.0 - y * y).sqrt();
        let theta: f64 = phi * i as f64;

        let x: f64 = theta.cos() * radius;
        let z: f64 = theta.sin() * radius;

        points.push((x, y, z));
    }

    Ok(points)
}
