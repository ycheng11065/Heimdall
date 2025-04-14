use d3_geo_rs::polygon_contains::polygon_contains;
use geo_types::{coord, Coord, LineString};
use spherekit::{get_mesh_points, DEFAULT_FIBONACCI_POINT_COUNT, SphereKitError};
use approx::assert_relative_eq;
use std::f64::consts::PI;

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
    // a larger shape should have more interior points
    assert!(mesh_points.len() > DEFAULT_FIBONACCI_POINT_COUNT / 10, 
            "A decent-sized shape should capture many points");
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
        Err(SphereKitError::MeshGenerationError(msg)) => {
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
        (0.0, 0.0),      // southwest corner
        (0.0, 30.0),     // northwest corner
        (30.0, 0.0),     // southeast corner
    ];
    
    let result = get_mesh_points(&polygon);
    assert!(result.is_ok(), "Expected successful mesh generation");
    
    let mesh_points_3d = result.unwrap();
    assert!(!mesh_points_3d.is_empty(), "Expected non-empty mesh points");
    
    assert!(mesh_points_3d.len() >= polygon.len(), "Expected at least the polygon vertices in the result");
    
    // convert 3D points back to 2D for checking containment
    let mesh_points_2d: Vec<(f64, f64)> = mesh_points_3d
        .iter()
        .map(|(x, y, z)| {
            let longitude: f64 = y.atan2(*x) * 180.0 / PI;
            let latitude: f64 = z.asin() * 180.0 / PI;
            (longitude, latitude)
        })
        .collect();
    
    // create LineString for containment checks
    let polygon_coords: Vec<Coord<f64>> = polygon
        .iter()
        .map(|point| coord! { x: point.0, y: point.1 })
        .collect();
    let polygon_linestring: [LineString<f64>; 1] = [LineString(polygon_coords)];
    
    // check that all points are contained in the polygon
    for (i, point) in mesh_points_2d.iter().enumerate() {
        let coord: Coord = coord! { x: point.0, y: point.1 };
        
        // special case for the polygon vertices
        let is_vertex: bool = polygon.iter().any(|v| 
            (v.0 - point.0).abs() < 1e-10 && (v.1 - point.1).abs() < 1e-10
        );
        
        if !is_vertex {
            assert!(
                polygon_contains(&polygon_linestring, &coord),
                "Point at index {} ({}, {}) is outside the polygon", i, point.0, point.1
            );
        }
    }
}