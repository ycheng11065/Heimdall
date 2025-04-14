use std::f64::consts::PI;
use crate::SphereKitError;

/// Converts geographic coordinates (longitude and latitude) from decimal degrees to 3D Cartesian coordinates
/// on a unit sphere.
///
/// # Arguments
///
/// * `longitude` - The longitude in decimal degrees (-180 to 180)
/// * `latitude` - The latitude in decimal degrees (-90 to 90)
///
/// # Returns
///
/// A tuple of (x, y, z) Cartesian coordinates
///
/// # Examples
///
/// ```
/// use spherekit::ll_to_cartesian;
///
/// let (x, y, z) = ll_to_cartesian(0.0, 0.0).unwrap();
/// assert!((x - 1.0).abs() < 1e-10);
/// assert!(y.abs() < 1e-10);
/// assert!(z.abs() < 1e-10);
///
/// // North pole
/// let (x, y, z) = ll_to_cartesian(0.0, 90.0).unwrap();
/// assert!(x.abs() < 1e-10);
/// assert!(y.abs() < 1e-10);
/// assert!((z - 1.0).abs() < 1e-10);
/// ```
pub fn ll_to_cartesian(longitude: f64, latitude: f64) -> Result<(f64, f64, f64), SphereKitError> {
    if longitude.abs() > 180.0 || latitude.abs() > 90.0 {
        return Err(SphereKitError::CoordinateRangeError { longitude, latitude });
    }
    
    let longitude_rad: f64 = longitude * PI / 180.0;
    let latitude_rad: f64 = latitude * PI / 180.0;
    
    let x: f64 = latitude_rad.cos() * longitude_rad.cos();
    let y: f64 = latitude_rad.cos() * longitude_rad.sin();
    let z: f64 = latitude_rad.sin();
    
    Ok((x, y, z))
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
pub fn stereographic_projection(point: (f64, f64, f64)) -> Result<(f64, f64), SphereKitError> {
    let (x, y, z) = point;

    // check if point is at or very close to the north pole
    if (z - 1.0).abs() < f64::EPSILON {
        return Err(SphereKitError::ProjectionError("Cannot project from the north pole (0, 0, 1)".to_string()));
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
pub fn inverse_stereographic_projection(point: (f64, f64)) -> Result<(f64, f64, f64), SphereKitError> {
    let (x, y) = point;

    if x.is_nan() || y.is_nan() || x.is_infinite() || y.is_infinite() {
        return Err(SphereKitError::InverseProjectionError("Input coordinates must be finite numbers".to_string()));
    }
    
    let denom: f64 = 1.0 + x.powi(2) + y.powi(2);
    
    let x_3d: f64 = 2.0 * x / denom;
    let y_3d: f64 = 2.0 * y / denom;
    let z_3d: f64 = (denom - 2.0) / denom;
    
    Ok((x_3d, y_3d, z_3d))
}
