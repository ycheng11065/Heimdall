use spherekit::inverse_stereographic_projection;
use approx::assert_relative_eq;

#[test]
fn test_origin() {
    // origin maps to the south pole (0, 0, -1)
    let result: (f64, f64, f64) = inverse_stereographic_projection((0.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, -1.0, epsilon = 1e-10);
}

#[test]
fn test_unit_circle_points() {
    // points on the unit circle map to the equator (z = 0)
    
    let result: (f64, f64, f64) = inverse_stereographic_projection((1.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, 1.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.0, epsilon = 1e-10);

    let result: (f64, f64, f64) = inverse_stereographic_projection((0.0, 1.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 1.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.0, epsilon = 1e-10);

    let result: (f64, f64, f64) = inverse_stereographic_projection((-1.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, -1.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.0, epsilon = 1e-10);

    let result: (f64, f64, f64) = inverse_stereographic_projection((0.0, -1.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, -1.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.0, epsilon = 1e-10);

    let point: (f64, f64) = (1.0 / 2.0_f64.sqrt(), 1.0 / 2.0_f64.sqrt());
    let result: (f64, f64, f64) = inverse_stereographic_projection(point).unwrap();
    assert_relative_eq!(result.0, point.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, point.1, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.0, epsilon = 1e-10);
}

#[test]
fn test_inside_unit_circle() {
    // points inside the unit circle map to the southern hemisphere (z < 0)
    
    let result: (f64, f64, f64) = inverse_stereographic_projection((0.5, 0.0)).unwrap();
    assert_relative_eq!(result.0, 0.8, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, -0.6, epsilon = 1e-10);
    
    // point is on the unit sphere
    let norm_squared: f64 = result.0.powi(2) + result.1.powi(2) + result.2.powi(2);
    assert_relative_eq!(norm_squared, 1.0, epsilon = 1e-10);
}

#[test]
fn test_outside_unit_circle() {
    // points outside the unit circle map to the northern hemisphere (z > 0)
    
    let result: (f64, f64, f64) = inverse_stereographic_projection((2.0, 0.0)).unwrap();
    assert_relative_eq!(result.0, 0.8, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.6, epsilon = 1e-10);

    let result: (f64, f64, f64) = inverse_stereographic_projection((0.0, 2.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-10);
    assert_relative_eq!(result.1, 0.8, epsilon = 1e-10);
    assert_relative_eq!(result.2, 0.6, epsilon = 1e-10);
    
    // point is on the unit sphere
    let norm_squared: f64 = result.0.powi(2) + result.1.powi(2) + result.2.powi(2);
    assert_relative_eq!(norm_squared, 1.0, epsilon = 1e-10);
}

#[test]
fn test_very_large_values() {
    // large values should approach the north pole
    let result: (f64, f64, f64) = inverse_stereographic_projection((1e6, 0.0)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-5);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-9);
    assert_relative_eq!(result.2, 1.0, epsilon = 1e-11); 
    
    let result: (f64, f64, f64) = inverse_stereographic_projection((0.0, 1e6)).unwrap();
    assert_relative_eq!(result.0, 0.0, epsilon = 1e-9);
    assert_relative_eq!(result.1, 0.0, epsilon = 1e-5);
    assert_relative_eq!(result.2, 1.0, epsilon = 1e-11);
    
    // check point with both x and y large
    let result: (f64, f64, f64) = inverse_stereographic_projection((1e6, 1e6)).unwrap();

    // should very close to the north pole, verify unit sphere
    let norm_squared: f64 = result.0.powi(2) + result.1.powi(2) + result.2.powi(2);
    assert_relative_eq!(norm_squared, 1.0, epsilon = 1e-10);
    assert_relative_eq!(result.2, 1.0, epsilon = 1e-12);
}

#[test]
fn test_invalid_inputs() {
    // NaN inputs
    let result = inverse_stereographic_projection((f64::NAN, 0.0));
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Input coordinates must be finite numbers".to_string());
    
    let result = inverse_stereographic_projection((0.0, f64::NAN));
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Input coordinates must be finite numbers".to_string());
    
    // infinite inputs
    let result = inverse_stereographic_projection((f64::INFINITY, 0.0));
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Input coordinates must be finite numbers".to_string());
    
    let result = inverse_stereographic_projection((0.0, f64::NEG_INFINITY));
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Input coordinates must be finite numbers".to_string());
}

#[test]
fn test_north_pole_approximation() {
    // check that as we go further out, we get closer to the north pole

    let result1: (f64, f64, f64) = inverse_stereographic_projection((1e3, 0.0)).unwrap();
    let result2: (f64, f64, f64) = inverse_stereographic_projection((1e6, 0.0)).unwrap();

    assert!(1.0 - result2.2 < 1.0 - result1.2);
}

#[test]
fn test_unit_sphere_constraint() {
    // outputs should lie on the unit sphere, regardless of input
    let test_points: [(f64, f64); 8] = [
        (0.0, 0.0),
        (1.0, 0.0),
        (0.0, 1.0),
        (1.0, 1.0),
        (2.0, 3.0),
        (10.0, 10.0),
        (0.1, 0.1),
        (-5.0, 7.0),
    ];
    
    for point in test_points.iter() {
        let result: (f64, f64, f64) = inverse_stereographic_projection(*point).unwrap();
        let norm_squared: f64 = result.0.powi(2) + result.1.powi(2) + result.2.powi(2);
        assert_relative_eq!(norm_squared, 1.0, epsilon = 1e-10, max_relative = 1e-10);
    }
}
