use spherekit::{fibonacci_sphere, SphereKitError};
use approx::assert_relative_eq;
use std::f64::consts::PI;

#[test]
fn test_fibonacci_sphere_single_point() {
    let result = fibonacci_sphere(1);
    assert!(result.is_ok());
    let points: Vec<(f64, f64)> = result.unwrap();
    assert_eq!(points.len(), 1);
    let (longitude, latitude) = points[0];
    
    // for a single point, we expect it to be at the "north pole"
    assert!(longitude >= -180.0 && longitude <= 180.0);
    assert_relative_eq!(latitude, 90.0, epsilon = 1e-10);
}

#[test]
fn test_fibonacci_sphere_multiple_points() {
    let n: usize = 100;
    let result = fibonacci_sphere(n);
    assert!(result.is_ok());
    let points: Vec<(f64, f64)> = result.unwrap();
    assert_eq!(points.len(), n);
    for (longitude, latitude) in points {
        // check longitude is normalized to [-180, 180]
        assert!(longitude >= -180.0 && longitude <= 180.0);
        // check latitude is within valid range [-90, 90]
        assert!(latitude >= -90.0 && latitude <= 90.0);
    }
}

#[test]
fn test_fibonacci_sphere_distribution() {
    let n: usize = 1000;
    let result = fibonacci_sphere(n);
    assert!(result.is_ok());
    let points: Vec<(f64, f64)> = result.unwrap();
    
    let mut sum_x: f64 = 0.0;
    let mut sum_y: f64 = 0.0;
    let mut sum_z: f64 = 0.0;
    
    for (longitude, latitude) in &points {
        let longitude_rad: f64 = longitude * PI / 180.0;
        let latitude_rad: f64 = latitude * PI / 180.0;
        
        let x: f64 = latitude_rad.cos() * longitude_rad.cos();
        let y: f64 = latitude_rad.cos() * longitude_rad.sin();
        let z: f64 = latitude_rad.sin();
        
        sum_x += x;
        sum_y += y;
        sum_z += z;
    }
    
    let center_x: f64 = sum_x / n as f64;
    let center_y: f64 = sum_y / n as f64;
    let center_z: f64 = sum_z / n as f64;
    
    // check that the average position of points is close to the center of the sphere
    assert_relative_eq!(center_x, 0.0, epsilon = 0.05);
    assert_relative_eq!(center_y, 0.0, epsilon = 0.05);
    assert_relative_eq!(center_z, 0.0, epsilon = 0.05);
}

#[test]
fn test_fibonacci_sphere_zero_points() {
    let result = fibonacci_sphere(0);
    
    // check that the function returns an error for zero points
    assert!(result.is_err());
    
    // check that it's specifically a FibonacciError with the expected message
    match result {
        Err(SphereKitError::FibonacciError(msg)) => {
            assert_eq!(msg, "Cannot generate zero points in fibonacci sphere");
        },
        Err(e) => panic!("Expected FibonacciError with specific message, got: {:?}", e),
        Ok(_) => panic!("Expected an error, but operation succeeded"),
    }
}

#[test]
fn test_points_are_unique() {
    let n: usize = 100;
    let result = fibonacci_sphere(n);
    assert!(result.is_ok());
    let points: Vec<(f64, f64)> = result.unwrap();
    
    for i in 0..points.len() {
        for j in (i+1)..points.len() {
            let (lon1, lat1) = points[i];
            let (lon2, lat2) = points[j];
            
            // check that no two points are the same (within a small tolerance)
            assert!(
                (lon1 - lon2).abs() > 1e-10 ||
                (lat1 - lat2).abs() > 1e-10
            );
        }
    }
}

#[test]
fn test_increasing_density() {
    let n1: usize = 100;
    let n2: usize = 1000;
    let points1: Vec<(f64, f64)> = fibonacci_sphere(n1).unwrap();
    let points2: Vec<(f64, f64)> = fibonacci_sphere(n2).unwrap();
    
    fn min_distance(points: &Vec<(f64, f64)>) -> f64 {
        let mut min_dist: f64 = f64::MAX;
        for i in 0..points.len() {
            for j in (i + 1)..points.len() {
                let (lon1, lat1) = points[i];
                let (lon2, lat2) = points[j];
                
                let lon1_rad: f64 = lon1 * PI / 180.0;
                let lat1_rad: f64 = lat1 * PI / 180.0;
                let lon2_rad: f64 = lon2 * PI / 180.0;
                let lat2_rad: f64 = lat2 * PI / 180.0;
                
                let delta_lon: f64 = (lon1_rad - lon2_rad).abs();
                let delta_lon: f64 = delta_lon.min(2.0 * PI - delta_lon);
                
                let central_angle: f64 = (lat1_rad.sin() * lat2_rad.sin() + 
                                    lat1_rad.cos() * lat2_rad.cos() * delta_lon.cos()).acos();
                
                min_dist = min_dist.min(central_angle);
            }
        }
        min_dist
    }
    
    let min_dist1: f64 = min_distance(&points1);
    let min_dist2: f64 = min_distance(&points2);
    
    // check that the minimum angular distance between points decreases with more points
    assert!(min_dist2 < min_dist1);
}