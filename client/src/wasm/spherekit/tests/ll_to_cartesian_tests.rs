use spherekit::ll_to_cartesian;
use approx::assert_relative_eq;

#[test]
fn test_ll_to_cartesian_origin() {
    // test the origin (0°, 0°) - should be (1, 0, 0)
    let result = ll_to_cartesian(0.0, 0.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, 1.0, epsilon = 1e-10);
    assert_relative_eq!(y, 0.0, epsilon = 1e-10);
    assert_relative_eq!(z, 0.0, epsilon = 1e-10);
}

#[test]
fn test_ll_to_cartesian_poles() {
    // test north pole (0°, 90°) - should be (0, 0, 1)
    let result = ll_to_cartesian(0.0, 90.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, 0.0, epsilon = 1e-10);
    assert_relative_eq!(y, 0.0, epsilon = 1e-10);
    assert_relative_eq!(z, 1.0, epsilon = 1e-10);
    
    // test south pole (0°, -90°) - should be (0, 0, -1)
    let result = ll_to_cartesian(0.0, -90.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, 0.0, epsilon = 1e-10);
    assert_relative_eq!(y, 0.0, epsilon = 1e-10);
    assert_relative_eq!(z, -1.0, epsilon = 1e-10);
}

#[test]
fn test_ll_to_cartesian_cardinal_points() {
    // test 90° east (90°, 0°) - should be (0, 1, 0)
    let result = ll_to_cartesian(90.0, 0.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, 0.0, epsilon = 1e-10);
    assert_relative_eq!(y, 1.0, epsilon = 1e-10);
    assert_relative_eq!(z, 0.0, epsilon = 1e-10);
    
    // test 90° west (-90°, 0°) - should be (0, -1, 0)
    let result = ll_to_cartesian(-90.0, 0.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, 0.0, epsilon = 1e-10);
    assert_relative_eq!(y, -1.0, epsilon = 1e-10);
    assert_relative_eq!(z, 0.0, epsilon = 1e-10);
    
    // test 180° (180°, 0°) - should be (-1, 0, 0)
    let result = ll_to_cartesian(180.0, 0.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, -1.0, epsilon = 1e-10);
    assert_relative_eq!(y, 0.0, epsilon = 1e-10);
    assert_relative_eq!(z, 0.0, epsilon = 1e-10);
    
    // test -180° (-180°, 0°) - should be (-1, 0, 0)
    let result = ll_to_cartesian(-180.0, 0.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    assert_relative_eq!(x, -1.0, epsilon = 1e-10);
    assert_relative_eq!(y, 0.0, epsilon = 1e-10);
    assert_relative_eq!(z, 0.0, epsilon = 1e-10);
}

#[test]
fn test_ll_to_cartesian_diagonal_points() {
    let result = ll_to_cartesian(45.0, 45.0);
    assert!(result.is_ok());
    let (x, y, z) = result.unwrap();
    let expected_xy = 0.5 * (2.0_f64).sqrt();
    assert_relative_eq!(x, expected_xy / (2.0_f64).sqrt(), epsilon = 1e-10);
    assert_relative_eq!(y, expected_xy / (2.0_f64).sqrt(), epsilon = 1e-10);
    assert_relative_eq!(z, 0.5 * (2.0_f64).sqrt(), epsilon = 1e-10);
    
    // verify the point is on the unit sphere
    assert_relative_eq!(x*x + y*y + z*z, 1.0, epsilon = 1e-10);
}

#[test]
fn test_ll_to_cartesian_boundary_values() {
    let result1 = ll_to_cartesian(180.0, 0.0);
    let result2 = ll_to_cartesian(-180.0, 0.0);
    assert!(result1.is_ok() && result2.is_ok());
    let (x1, y1, z1) = result1.unwrap();
    let (x2, y2, z2) = result2.unwrap();
    
    // both 180° and -180° should map to the same point
    assert_relative_eq!(x1, x2, epsilon = 1e-10);
    assert_relative_eq!(y1, y2, epsilon = 1e-10);
    assert_relative_eq!(z1, z2, epsilon = 1e-10);
    
    let result1 = ll_to_cartesian(0.0, 90.0);
    let result2 = ll_to_cartesian(180.0, 90.0);
    assert!(result1.is_ok() && result2.is_ok());
    let (_x1, _y1, z1) = result1.unwrap();
    let (_x2, _y2, z2) = result2.unwrap();
    
    // all points at 90° latitude should be the same (north pole)
    assert_relative_eq!(z1, 1.0, epsilon = 1e-10);
    assert_relative_eq!(z2, 1.0, epsilon = 1e-10);
}

#[test]
fn test_ll_to_cartesian_err_out_of_range() {
    // these should produce errors
    let result1 = ll_to_cartesian(200.0, 0.0);
    let result2 = ll_to_cartesian(0.0, 100.0);
    
    assert!(result1.is_err() && result2.is_err());
}

#[test]
fn test_ll_to_cartesian_unit_sphere() {
    for lon in (-180..=180).step_by(30) {
        for lat in (-90..=90).step_by(15) {
            let result = ll_to_cartesian(lon as f64, lat as f64);
            assert!(result.is_ok());
            let (x, y, z) = result.unwrap();
            
            // check that the point is on the unit sphere (x² + y² + z² = 1)
            assert_relative_eq!(x*x + y*y + z*z, 1.0, epsilon = 1e-10);
        }
    }
}

#[test]
fn test_ll_to_cartesian_symmetry() {
    // test symmetry across the equator
    let north: (f64, f64, f64) = ll_to_cartesian(45.0, 30.0).unwrap();
    let south: (f64, f64, f64) = ll_to_cartesian(45.0, -30.0).unwrap();
    
    assert_relative_eq!(north.0, south.0, epsilon = 1e-10);
    assert_relative_eq!(north.1, south.1, epsilon = 1e-10);
    assert_relative_eq!(north.2, -south.2, epsilon = 1e-10);
    
    // test symmetry across the prime meridian
    let east: (f64, f64, f64) = ll_to_cartesian(30.0, 45.0).unwrap();
    let west: (f64, f64, f64) = ll_to_cartesian(-30.0, 45.0).unwrap();
    
    assert_relative_eq!(east.0, west.0, epsilon = 1e-10);
    assert_relative_eq!(east.1, -west.1, epsilon = 1e-10);
    assert_relative_eq!(east.2, west.2, epsilon = 1e-10);
}