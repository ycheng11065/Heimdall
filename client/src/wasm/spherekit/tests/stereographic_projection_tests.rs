use spherekit::stereographic_projection;
use approx::assert_relative_eq;

#[test]
fn test_south_pole() {
    // south pole (0, 0, -1) projects to (0, 0)
    let result: (f64, f64) = stereographic_projection((0.0, 0.0, -1.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
}

#[test]
fn test_equator_points() {
    // equator (z = 0) should project to points at distance of 1 from origin
    let result: (f64, f64) = stereographic_projection((1.0, 0.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, 1.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);

    let result: (f64, f64) = stereographic_projection((0.0, 1.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 1.0, epsilon = 1e-10);

    let point: (f64, f64, f64) = (1.0 / 2.0_f64.sqrt(), 1.0 / 2.0_f64.sqrt(), 0.0);
    let result: (f64, f64) = stereographic_projection(point).unwrap();
    assert_relative_eq!(result.0, point.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, point.1, epsilon = 1e-10);
}

#[test]
fn test_northern_hemisphere() {
    // (0, 0, 0.5) should project to (0, 0, 2)
    let result: (f64, f64) = stereographic_projection((0.0, 0.0, 0.5)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);

    // point with positive z but not at north pole
    let result: (f64, f64) = stereographic_projection((0.6, 0.0, 0.8)).unwrap();
    assert_relative_eq!(result.0, 3.0, epsilon = 1e-10); // 0.6 / (1 - 0.8) = 3
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
}

#[test]
fn test_southern_hemisphere() {
    // (0, 0, -0.5)
    let result: (f64, f64) = stereographic_projection((0.0, 0.0, -0.5)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);

    // (0.5, 0.5, -0.5)
    let result: (f64, f64) = stereographic_projection((0.5, 0.5, -0.5)).unwrap();
    assert_relative_eq!(result.0, 1.0 / 3.0, epsilon = 1e-10); // 0.5 / (1 - (-0.5)) = 1/3
    assert_relative_eq!(result.1, 1.0 / 3.0, epsilon = 1e-10);
}

#[test]
fn test_north_pole_error() {
    let result = stereographic_projection((0.0, 0.0, 1.0));
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Cannot project from the north pole (0, 0, 1)".to_string());
}

#[test]
fn test_near_north_pole() {
    // point very close to the north pole returns error
    let epsilon: f64 = f64::EPSILON / 2.0;
    let result = stereographic_projection((0.0, 0.0, 1.0 - epsilon));
    
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Cannot project from the north pole"));
    
    // near-pole point with non-zero x, y
    let near_pole: (f64, f64, f64) = (f64::EPSILON, f64::EPSILON, 1.0 - 2.0 * f64::EPSILON);
    let result: (f64, f64) = stereographic_projection(near_pole).unwrap();
    
    assert!(result.0.is_finite());
    assert!(result.1.is_finite());
}

#[test]
fn test_non_unit_sphere_points() {
    // this test verifies the behavior for points that aren't on the unit sphere.
    
    // norm > 1
    let result: (f64, f64) = stereographic_projection((2.0, 0.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, 2.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
    
    // norm < 1
    let result: (f64, f64) = stereographic_projection((0.3, 0.3, 0.3)).unwrap();
    assert_relative_eq!(result.0, 0.3 / (1.0 - 0.3), epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.3 / (1.0 - 0.3), epsilon = 1e-10);
}

