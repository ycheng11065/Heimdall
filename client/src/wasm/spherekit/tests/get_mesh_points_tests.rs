use d3_geo_rs::polygon_contains::polygon_contains;
use geo_types::{coord, Coord, LineString};
use spherekit::{get_mesh_points, DEFAULT_FIBONACCI_POINT_COUNT, SphereKitError};
use approx::assert_relative_eq;

#[test]
fn test_get_mesh_points_triangle() {
    let triangle: Vec<(f64, f64)> = vec![
        (0.0, 0.0),
        (10.0, 10.0),
        (20.0, 0.0)
    ];
    
    let result = get_mesh_points(&triangle);
    assert!(result.is_ok(), "Should successfully generate mesh points for a valid triangle");
    
    let mesh_points: Vec<(f64, f64, f64)> = result.unwrap();
    // should include at least the original points
    assert!(mesh_points.len() >= triangle.len(), "Should have at least the original points");
    
    // check that the result contains points inside the triangle
    assert!(mesh_points.len() > triangle.len(), "Should have added interior points");
}

#[test]
fn test_get_mesh_points_rectangle() {
    let rectangle: Vec<(f64, f64)> = vec![
        (-10.0, -10.0),
        (-10.0, 10.0),
        (10.0, 10.0),
        (10.0, -10.0)
    ];
    
    let result = get_mesh_points(&rectangle);
    assert!(result.is_ok());
    let mesh_points: Vec<(f64, f64, f64)> = result.unwrap();
    
    // a 20°×20° rectangle covers approximately 1% of a sphere's surface
    // so we should expect around 1% of the Fibonacci points to be in it
    let expected_min_points: usize = (DEFAULT_FIBONACCI_POINT_COUNT as f64 * 0.005).ceil() as usize + 4;
    
    assert!(
        mesh_points.len() >= expected_min_points,
        "Expected at least {} points for this rectangle, got {}",
        expected_min_points, mesh_points.len()
    );
    
    // ensure the original vertices are included
    assert!(mesh_points.len() >= rectangle.len(), 
        "Should include at least the original vertices");
}

#[test]
fn test_get_mesh_points_small_polygon() {
    let tiny_polygon: Vec<(f64, f64)> = vec![
        (0.0, 0.0),
        (0.001, 0.001),
        (0.002, 0.0)
    ];
    
    let result = get_mesh_points(&tiny_polygon);
    assert!(result.is_ok());
    
    let mesh_points: Vec<(f64, f64, f64)> = result.unwrap();
    //sShould at least contain the original points
    assert_eq!(mesh_points.len(), tiny_polygon.len(), 
                "A very small polygon might only have boundary points");
}

#[test]
fn test_get_mesh_points_empty_polygon() {
    // empty vector should return an error
    let empty_polygon: Vec<(f64, f64)> = vec![];
    
    let result = get_mesh_points(&empty_polygon);
    assert!(result.is_err());
    match result {
        Err(SphereKitError::EmptyPointSetError(msg)) => {
            assert_eq!(msg, "Outer ring cannot be empty");
        }, 
        Err(e) => panic!("Expected MeshGenerationError with specific message, got: {:?}", e),
        Ok(_) => panic!("Expected an error, but operation succeeded"),
    }
}

#[test]
fn test_get_mesh_points_insufficient_points() {
    // less than 3 points should return an error
    let line: Vec<(f64, f64)> = vec![(0.0, 0.0), (10.0, 10.0)];
    
    let result = get_mesh_points(&line);
    assert!(result.is_err());

    match result {
        Err(SphereKitError::MeshGenerationError(msg)) => {
            assert_eq!(msg, "Outer ring must have at least 3 points to form a valid polygon");
        }, 
        Err(e) => panic!("Expected MeshGenerationError with specific message, got: {:?}", e),
        Ok(_) => panic!("Expected an error, but operation succeeded"),
    }
}

#[test]
fn test_get_mesh_points_invalid_coordinates() {
    let invalid_polygon: Vec<(f64, f64)> = vec![
        (0.0, 0.0),
        (10.0, 10.0),
        (200.0, 10.0) // invalid longitude (> 180)
    ];
    
    let result = get_mesh_points(&invalid_polygon);
    assert!(result.is_err());
    
    match result.unwrap_err() {
        SphereKitError::CoordinateRangeError { longitude, latitude } => {
            assert_eq!(longitude, 200.0);
            assert_eq!(latitude, 10.0);
        },
        err => panic!("Expected CoordinateRangeError but got: {:?}", err)
    }
}

#[test]
fn test_get_mesh_points_consistency() {
    // test that running the function multiple times with the same input
    // produces consistent results (same number of points)

    let polygon: Vec<(f64, f64)> = vec![
        (0.0, 0.0),
        (10.0, 10.0),
        (20.0, 0.0)
    ];
    
    let result1: Vec<(f64, f64, f64)> = get_mesh_points(&polygon).unwrap();
    let result2: Vec<(f64, f64, f64)> = get_mesh_points(&polygon).unwrap();
    
    assert_eq!(result1.len(), result2.len(), 
                "Should produce consistent number of points for the same input");
}

#[test]
fn test_get_mesh_points_3d_coordinates_on_unit_sphere() {
    let polygon: Vec<(f64, f64)> = vec![
        (0.0, 0.0),
        (10.0, 10.0),
        (20.0, 0.0)
    ];
    let mesh_points: Vec<(f64, f64, f64)> = get_mesh_points(&polygon).unwrap();
    for point in mesh_points {
        let (x, y, z) = point;
        // check that the point is on the unit sphere
        let distance_from_origin = (x.powi(2) + y.powi(2) + z.powi(2)).sqrt();
        assert_relative_eq!(distance_from_origin, 1.0, epsilon = 1e-10);
    }
}

#[test]
fn test_mesh_points_contained_in_polygon() {
    let polygon: Vec<(f64, f64)> = vec![
        (0.0, 0.0),     // southwest corner
        (0.0, 30.0),    // northwest corner
        (30.0, 0.0),    // southeast corner
    ];
    
    let result = get_mesh_points(&polygon);
    assert!(result.is_ok(), "Expected successful mesh generation");
    
    let mesh_points_3d: Vec<(f64, f64, f64)> = result.unwrap();
    assert!(!mesh_points_3d.is_empty(), "Expected non-empty mesh points");
    assert!(mesh_points_3d.len() >= polygon.len(), "Expected at least the polygon vertices in the result");
    
    // radians here because that's what polygon_contains expects
    let polygon_coords: Vec<Coord<f64>> = polygon
        .iter()
        .map(|point| coord! { x: point.0.to_radians(), y: point.1.to_radians() })
        .collect();
    let polygon_linestring: [LineString<f64>; 1] = [LineString(polygon_coords)];
    
    // convert 3D cartesian points back to longitude/latitude (in radians for checking)
    for (i, point_3d) in mesh_points_3d.iter().enumerate() {
        let (x, y, z) = *point_3d;
        
        let lon: f64 = y.atan2(x); // in rads
        let lat: f64 = z.asin();   // in rads
        
        let coord: Coord = coord! { x: lon, y: lat };
        
        // special case for the polygon vertices
        let is_vertex: bool = polygon.iter().any(|v| {
            let v_lon: f64 = v.0.to_radians();
            let v_lat: f64 = v.1.to_radians();
            (v_lon - lon).abs() < 1e-10 && (v_lat - lat).abs() < 1e-10
        });
        
        if !is_vertex {
            // check that the point is contained in the polygon
            assert!(
                polygon_contains(&polygon_linestring, &coord),
                "Point at index {} ({}, {}) (cartesian: {}, {}, {}) is outside the polygon", 
                i, 
                lon.to_degrees(), lat.to_degrees(),
                x, y, z
            );
        }
    }
}