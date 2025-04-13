use std::{f64::consts::PI, u32};
use geojson::{Feature, GeoJson, Geometry, PolygonType, Value};
use ghx_constrained_delaunay::types::Edge;

pub fn handle_polygon_feature(geojson_feature: &str) -> Result<(), String> {

    let geojson: GeoJson = geojson_feature.parse::<GeoJson>()
        .map_err(|err| format!("Failed to parse GeoJSON: {}", err))?;
    
    let feature: Feature = Feature::try_from(geojson)
        .map_err(|err| format!("Failed to convert to Feature: {}", err))?;

    let geometry: Geometry = feature.geometry.unwrap(); // parser would've catched if none

    let polygon: PolygonType = match geometry.value {
        Value::Polygon(polygon) => polygon,
        _ => return Err("Expected a polygon".to_string())
    };

    if polygon.is_empty() { return Err("Polygon is empty".to_string()); }

    let outer_ring: &Vec<Vec<f64>> = &polygon[0];

    // get edges constraint of polygon
    let outer_ring_edges: Vec<Edge> = get_ring_edges(outer_ring.len())
        .map_err(|err| format!("Failed to generate outer ring edges: {}", err))?;
    

    // convert points from longitude and latitude to cartesian coordinates on the unit sphere
    let mut cartesian_outer_ring: Vec<(f64, f64, f64)> = Vec::with_capacity(outer_ring.len());

    for point in outer_ring {
        let cartesian_point: (f64, f64, f64) = ll_to_cartesian(point[0], point[1]);
        cartesian_outer_ring.push(cartesian_point);
    }
    
    // TODO: add fibonacci sphere points which are within the particular shape.

    // generate stereographical projection of points
    let mut stereographic_projection_outer_ring: Vec<(f64, f64)> = Vec::with_capacity(outer_ring.len());

    for cartesian_point in cartesian_outer_ring {
        let stereographic_projection: (f64, f64) = stereographic_projection(cartesian_point)
            .map_err(|err| format!("Point: ({}, {}, {}) generated error {}", cartesian_point.0, cartesian_point.1, cartesian_point.2, err))?;

        stereographic_projection_outer_ring.push(stereographic_projection);
    }

    // TODO: obtain triangulation
    
    Ok(())
}

// TODO: add error checking to make sure longitude and latitudes are in rads
// TODO: add doc
// TODO: add tests
pub fn ll_to_cartesian(longitude: f64, latitude: f64) -> (f64, f64, f64) {
    let x: f64 = latitude.cos() * longitude.cos();
    let y: f64 = latitude.cos() * longitude.sin();
    let z: f64 = longitude.sin();

    (x, y, z)
}   

// TODO: add doc
// TODO: add tests
pub fn get_ring_edges(n: usize) -> Result<Vec<Edge>, String> {
    if n > u32::MAX as usize { return Err("Too many vertices in the ring".to_string()); }
    if n == 0 { return Err("The ring is empty".to_string()); }

    let mut edges: Vec<Edge> = Vec::new();

    for i in 0..n {
        let from: u32 = i as u32;
        let to: u32 = ((i + 1) % n) as u32; // wraps around to 0 for last vertex

        edges.push(Edge { from, to });
    }

    Ok(edges)
}

/// Projects a point from the UNIT SPHERE in 3D space onto a 2D plane using stereographic projection.
///
/// Stereographic projection maps points from a sphere to a plane, preserving angles but not areas.
/// This implementation projects from the north pole (0, 0, 1) onto the plane z = 0.
///
/// # Arguments
///
/// * `point` - A 3D point (x, y, z) on or near the unit sphere
///
/// # Returns
///
/// * `Ok((f64, f64))` - A 2D point (x_2d, y_2d) representing the projected coordinates on the plane
/// * `Err(String)` - An error message if the projection cannot be performed
///
/// # Examples
///
/// ```
/// use spherekit::stereographic_projection;
/// 
/// let south_point = (0.5, 0.5, -0.7071);
/// 
/// match stereographic_projection(south_point) {
///     Ok(projected) => println!("Projected coordinates: {:?}", projected),
///     Err(e) => println!("Error: {}", e),
/// }
/// ```
pub fn stereographic_projection(point: (f64, f64, f64)) -> Result<(f64, f64), String> {
    let (x, y, z) = point;

    // check if point is at or very close to the north pole
    if (z - 1.0).abs() < f64::EPSILON {
        return Err("Cannot project from the north pole (0, 0, 1)".to_string());
    }

    let x_2d: f64 = x / (1.0 - z);
    let y_2d: f64 = y / (1.0 - z);

    Ok((x_2d, y_2d))
}

/// Projects a point from a 2D plane back onto the unit sphere in 3D space using inverse stereographic projection.
///
/// This is the inverse operation of stereographic projection, mapping points from the plane z = 0
/// back to the unit sphere. All projected points will be on the unit sphere.
///
/// # Arguments
///
/// * `point` - A 2D point (x, y) on the plane
///
/// # Returns
///
/// * `Ok((f64, f64, f64))` - A 3D point (x_3d, y_3d, z_3d) on the unit sphere
/// * `Err(String)` - An error message if the inverse projection cannot be performed
///
/// # Examples
///
/// ```
/// use spherekit::inverse_stereographic_projection;
/// 
/// let plane_point = (0.5, 0.5);
/// 
/// match inverse_stereographic_projection(plane_point) {
///     Ok(sphere_point) => println!("Sphere coordinates: {:?}", sphere_point),
///     Err(e) => println!("Error: {}", e),
/// }
/// ```
pub fn inverse_stereographic_projection(point: (f64, f64)) -> Result<(f64, f64, f64), String> {
    let (x, y) = point;

    if x.is_nan() || y.is_nan() || x.is_infinite() || y.is_infinite() {
        return Err("Input coordinates must be finite numbers".to_string());
    }
    
    let denom: f64 = 1.0 + x.powi(2) + y.powi(2);
    
    let x_3d: f64 = 2.0 * x / denom;
    let y_3d: f64 = 2.0 * y / denom;
    let z_3d: f64 = (denom - 2.0) / denom;
    
    Ok((x_3d, y_3d, z_3d))
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
/// assert_eq!(points.len(), 100);
/// 
/// // Verify a point is on the unit sphere
/// let (x, y, z) = points[0];
/// assert!((x*x + y*y + z*z - 1.0).abs() < 1e-10);
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
