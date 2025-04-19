use std::f64::consts::PI;
use crate::SphereKitError;

/// Generates evenly distributed points on a unit sphere using the Fibonacci spiral method.
/// Points are returned as longitude and latitude coordinates in radians.
///
/// # Arguments
///
/// * `n` - Number of points to generate (must be > 0)
///
/// # Returns
///
/// * `Result<Vec<(f64, f64)>, SphereKitError>` - Vector of longitude and latitude coordinates
/// in radians representing points on the unit sphere. Longitude is in range [-π, π] and 
/// latitude is in range [-π/2, π/2].
///
/// # Errors
///
/// Returns error if `n` is 0 or if division by zero would occur.
///
/// # Example
///
/// ```
/// use spherekit::fibonacci_sphere;
/// use std::f64::consts::PI;
///
/// let points = fibonacci_sphere(100).unwrap();
/// assert_eq!(points.len(), 100);
///
/// // Verify the coordinates are valid
/// let (longitude, latitude) = points[0];
/// assert!(longitude >= -PI && longitude <= PI);
/// assert!(latitude >= -PI/2.0 && latitude <= PI/2.0);
/// ```
pub fn fibonacci_sphere(n: usize) -> Result<Vec<(f64, f64)>, SphereKitError> {
    if n == 0 {
        return Err(SphereKitError::FibonacciError("Cannot generate zero points in fibonacci sphere".to_string()));
    }
    
    let phi: f64 = PI * (5.0_f64.sqrt() - 1.0);
    let mut points: Vec<(f64, f64)> = Vec::with_capacity(n);
    let denominator: f64 = if n > 1 { n as f64 - 1.0 } else { 1.0 };
    
    if denominator.abs() < f64::EPSILON {
        return Err(SphereKitError::FibonacciError("Cannot divide by zero".to_string()));
    }
    
    for i in 0..n {
        let y: f64 = 1.0 - (i as f64 / denominator) * 2.0;
        let theta: f64 = phi * i as f64;
        
        let mut longitude: f64 = theta % (2.0 * PI); // Keep longitude in [0, 2π]
        
        // Convert to range [-π, π]
        if longitude > PI {
            longitude -= 2.0 * PI;
        }
        
        let latitude: f64 = y.asin(); // Already in radians
        
        points.push((longitude, latitude));
    }
    
    Ok(points)
}