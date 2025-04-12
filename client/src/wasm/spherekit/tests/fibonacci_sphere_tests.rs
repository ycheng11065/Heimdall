use spherekit::fibonacci_sphere;
use approx::assert_relative_eq;

#[test]
fn test_fibonacci_sphere_single_point() {
    let result = fibonacci_sphere(1);
    assert!(result.is_ok());
    
    let points: Vec<(f64, f64, f64)> = result.unwrap();
    assert_eq!(points.len(), 1);
    
    let (x, y, z) = points[0];

    // make sure the single point is in the center of the sphere
    assert_relative_eq!(x, 0.0, epsilon = 1e-10);
    assert_relative_eq!(y, 1.0, epsilon = 1e-10);
    assert_relative_eq!(z, 0.0, epsilon = 1e-10);
}

#[test]
fn test_fibonacci_sphere_multiple_points() {
    let n: usize = 100;
    let result = fibonacci_sphere(n);
    assert!(result.is_ok());
    
    let points: Vec<(f64, f64, f64)> = result.unwrap();
    assert_eq!(points.len(), n);
    
    for (x, y, z) in points {
        let distance_from_origin: f64 = (x*x + y*y + z*z).sqrt();

        // check that each point is on the unit sphere
        assert_relative_eq!(distance_from_origin, 1.0, epsilon = 1e-10);
    }
}

#[test]
fn test_fibonacci_sphere_distribution() {
    let n: usize = 1000;
    let result = fibonacci_sphere(n);
    assert!(result.is_ok());
    
    let points: Vec<(f64, f64, f64)> = result.unwrap();
    
    let mut sum_x: f64 = 0.0;
    let mut sum_y: f64 = 0.0;
    let mut sum_z: f64 = 0.0;
    
    for (x, y, z) in &points {
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
    assert_eq!(result.unwrap_err(), "Cannot generate zero points".to_string());
}

#[test]
fn test_points_are_unique() {
    let n: usize = 100;
    let result = fibonacci_sphere(n);
    assert!(result.is_ok());
    
    let points: Vec<(f64, f64, f64)> = result.unwrap();
    
    for i in 0..points.len() {
        for j in (i+1)..points.len() {
            let (x1, y1, z1) = points[i];
            let (x2, y2, z2) = points[j];
            
            // check that no two points are the same
            // (within a small tolerance)
            assert!(
                (x1 - x2).abs() > 1e-10 || 
                (y1 - y2).abs() > 1e-10 || 
                (z1 - z2).abs() > 1e-10
            );
        }
    }
}

#[test]
fn test_increasing_density() {
    let n1: usize = 100;
    let n2: usize = 1000;
    
    let points1: Vec<(f64, f64, f64)> = fibonacci_sphere(n1).unwrap();
    let points2: Vec<(f64, f64, f64)> = fibonacci_sphere(n2).unwrap();
    
    fn min_distance(points: &Vec<(f64, f64, f64)>) -> f64 {
        let mut min_dist: f64 = f64::MAX;
        for i in 0..points.len() {
            for j in (i + 1)..points.len() {
                let (x1, y1, z1) = points[i];
                let (x2, y2, z2) = points[j];
                
                let dist: f64 = ((x1 - x2).powi(2) + (y1 - y2).powi(2) + (z1 - z2).powi(2)).sqrt();
                min_dist = min_dist.min(dist);
            }
        }
        min_dist
    }
    
    let min_dist1: f64 = min_distance(&points1);
    let min_dist2: f64 = min_distance(&points2);
    
    // check that the minimum distance between points decreases with more points
    // (i.e., the points are more densely packed)
    assert!(min_dist2 < min_dist1);
}