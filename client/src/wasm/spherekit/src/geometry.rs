use std::f64::consts::PI;
use std::f64::EPSILON;
use crate::SphereKitError;
use nalgebra::{Rotation, Rotation3, Unit, Vector3};
use ghx_constrained_delaunay::types::Vertex2d;

/// A 2D point representation used for constrained Delaunay triangulation.
///
/// This struct provides a simple wrapper for 2D coordinates and implements the
/// `Vertex2d` trait required by the constrained Delaunay triangulation algorithm.
///
/// # Fields
///
/// * `x` - The x-coordinate of the point in 2D space
/// * `y` - The y-coordinate of the point in 2D space
///
#[derive(Copy, Clone)]
pub struct Point2D {
    pub x: f64,
    pub y: f64,
}

// Implement Vertex2d for Point2D
impl Vertex2d for Point2D {
    fn x(self) -> f64 {
        self.x
    }
    
    fn y(self) -> f64 {
        self.y
    }
}

/// Converts geographic coordinates (longitude and latitude) from decimal degrees to 3D Cartesian coordinates
/// on a unit sphere.
///
/// This function transforms a point specified by longitude and latitude into the corresponding point 
/// on a unit sphere in 3D Cartesian space where the center of the sphere is at the origin (0,0,0).
///
/// # Arguments
///
/// * `longitude` - The longitude in decimal degrees (-180 to 180), where 0° is the prime meridian,
///   positive values are east, and negative values are west
/// * `latitude` - The latitude in decimal degrees (-90 to 90), where 0° is the equator,
///   90° is the north pole, and -90° is the south pole
///
/// # Returns
///
/// * `Ok((f64, f64, f64))` - A tuple of (x, y, z) Cartesian coordinates on the unit sphere
/// * `Err(SphereKitError::CoordinateRangeError)` - An error if the longitude or latitude values are outside their valid ranges
///
/// # Mathematical formula
///
/// For coordinates in degrees:
/// * x = cos(latitude_rad) * cos(longitude_rad)
/// * y = cos(latitude_rad) * sin(longitude_rad)
/// * z = sin(latitude_rad)
///
/// Where latitude_rad = latitude * π/180 and longitude_rad = longitude * π/180
///
/// # Examples
///
/// ```
/// use spherekit::ll_to_cartesian;
///
/// let (x, y, z) = ll_to_cartesian(0.0, 0.0).unwrap(); // Equator at prime meridian
/// assert!((x - 1.0).abs() < 1e-10);
///
/// assert!(ll_to_cartesian(190.0, 0.0).is_err()); // Invalid coordinates
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


/// Projects a point from the unit sphere in 3D space onto a 2D plane using stereographic projection.
///
/// Stereographic projection maps points from a sphere to a plane, preserving angles but not areas.
/// This implementation projects from the north pole (0, 0, 1) onto the plane z = 0.
/// Every point on the sphere except the north pole itself has a unique corresponding point on the plane.
///
/// # Arguments
///
/// * `point` - A 3D point (x, y, z) on or near the unit sphere
///
/// # Returns
///
/// * `Ok((f64, f64))` - A 2D point (x_2d, y_2d) representing the projected coordinates on the plane
/// * `Err(SphereKitError::ProjectionError)` - An error if the point is at or very close to the north pole
///
/// # Mathematical formula
///
/// For a 3D point (x, y, z) on the unit sphere, the projected 2D point (x_2d, y_2d) is:
/// * x_2d = x / (1 - z)
/// * y_2d = y / (1 - z)
///
/// # Examples
///
/// ```
/// use spherekit::stereographic_projection;
/// 
/// // Project a point on the sphere to the plane
/// let sphere_point = (0.5, 0.5, -0.7071);
/// 
/// match stereographic_projection(sphere_point) {
///     Ok((x, y)) => println!("Projected coordinates: ({}, {})", x, y),
///     Err(e) => println!("Error: {}", e),
/// }
///
/// // Attempting to project the north pole will result in an error
/// let north_pole = (0.0, 0.0, 1.0);
/// assert!(stereographic_projection(north_pole).is_err());
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
/// back to the unit sphere. The projection is from the north pole (0, 0, 1) of the sphere.
/// Every point on the plane has a unique corresponding point on the sphere (except for the north pole itself,
/// which corresponds to the point at infinity on the plane).
///
/// # Arguments
///
/// * `point` - A 2D point (x, y) on the plane
///
/// # Returns
///
/// * `Ok((f64, f64, f64))` - A 3D point (x_3d, y_3d, z_3d) on the unit sphere
/// * `Err(SphereKitError::InverseProjectionError)` - An error if the input coordinates are not finite numbers
///
/// # Mathematical formula
///
/// For a 2D point (x, y), the corresponding 3D point (x_3d, y_3d, z_3d) on the unit sphere is:
/// * x_3d = 2x / (1 + x² + y²)
/// * y_3d = 2y / (1 + x² + y²)
/// * z_3d = (x² + y² - 1) / (1 + x² + y²)
///
/// # Examples
///
/// ```
/// use spherekit::inverse_stereographic_projection;
/// 
/// let plane_point = (0.5, 0.5);
/// 
/// match inverse_stereographic_projection(plane_point) {
///     Ok(sphere_point) => {
///         let (x, y, z) = sphere_point;
///         // Verify the point is on the unit sphere
///         assert!((x*x + y*y + z*z - 1.0).abs() < 1e-10);
///         println!("Sphere coordinates: ({}, {}, {})", x, y, z);
///     },
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

/// Rotates a set of 3D points on a unit sphere so that their centroid aligns with the south pole.
///
/// This function calculates the center point of the provided set of 3D points, then creates a rotation
/// that maps this center to the south pole (0, 0, -1). All points in the set are then rotated using
/// this same rotation matrix.
///
/// # Arguments
///
/// * `points` - A vector of 3D points `(x, y, z)` on or near the unit sphere
///
/// # Returns
///
/// * `Ok(Vec<(f64, f64, f64)>)` - A vector containing the rotated 3D points
/// * `Err(SphereKitError)` - An error if the rotation cannot be performed:
///   - `EmptyPointSetError` if the input vector is empty
///   - `RotationError` if the centroid of points is too close to zero (evenly distributed points)
///   - `RotationError` if a rotation axis cannot be found (when points are at the north pole, 
///     on the equator, or in other special configurations)
///
/// # Examples
///
/// ```
/// use spherekit::rotate_points_to_south_pole;
///
/// let points = vec![(0.5, 0.5, 0.7071), (0.6, 0.4, 0.6928), (0.7, 0.3, 0.6481)];
///
/// match rotate_points_to_south_pole(&points) {
///     Ok(rotated) => println!("Rotated points: {:?}", rotated),
///     Err(e) => println!("Error: {}", e),
/// }
/// ```
pub fn rotate_points_to_south_pole(points: &Vec<(f64, f64, f64)>) -> Result<Vec<(f64, f64, f64)>, SphereKitError> {
    if points.is_empty() {
        return Err(SphereKitError::EmptyPointSetError("Cannot rotate an empty set of points".to_string()));
    }

    let mut center = Vector3::new(0.0, 0.0, 0.0);
    
    for (x, y, z) in points.iter() {
        center.x += x;
        center.y += y;
        center.z += z;
    }
    center /= points.len() as f64;

    // check if center is too small to normalize (should only happen if there's an even distribution of points in the set all over the sphere)
    if center.magnitude() < EPSILON {
        return Err(SphereKitError::RotationError("Points centroid is effectively zero; cannot determine rotation direction".to_string()));
    }

    let center = Unit::new_normalize(center);

    let south_pole = Vector3::new(0.0, 0.0, -1.0);

    // make rotation object which defines rotation between center of polygon and south pole
    let rotation: Rotation<f64, 3> = match Rotation3::rotation_between(&center, &south_pole) {
        Some(rotation) => rotation,
        None => return Err(SphereKitError::RotationError("Failed to compute rotation between points centroid and south pole".to_string())),
    };

    let mut rotated_points: Vec<(f64, f64, f64)> = Vec::with_capacity(points.len());
    for point in points.iter() {
        let p = rotation * Vector3::new(point.0, point.1, point.2);
        rotated_points.push((p.x, p.y, p.z));
    }

    Ok(rotated_points)
}
