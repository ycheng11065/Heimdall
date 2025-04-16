use spherekit::{rotate_points_to_south_pole, SphereKitError};
use approx::assert_relative_eq;
use nalgebra::{Vector3, Unit};

#[test]
fn test_rotate_points_to_south_pole_empty_set() {
    let empty_points: Vec<(f64, f64, f64)> = Vec::new();
    let result = rotate_points_to_south_pole(&empty_points);
    assert!(result.is_err());
    match result {
        Err(SphereKitError::EmptyPointSetError(_)) => (),
        _ => panic!("Expected EmptyPointSetError"),
    }
}

#[test]
fn test_rotate_points_to_south_pole_single_point() {
    let points: Vec<(f64, f64, f64)> = vec![(0.0, 0.0, 1.0)]; 
    let result = rotate_points_to_south_pole(&points);
    
    assert!(result.is_err());

    match result {
        Err(SphereKitError::RotationError(msg)) => {
            assert_eq!(msg, "Failed to compute rotation between points centroid and south pole");
        },
        _ => panic!("Expected RotationError with specific message"),
    }
}

#[test]
fn test_rotate_points_to_south_pole_north_cluster() {
    // north pole cluster
    let points: Vec<(f64, f64, f64)> = vec![
        (0.1, 0.1, 0.99), 
        (0.0, 0.2, 0.98), 
        (-0.1, 0.1, 0.985)
    ];
    
    let rotated: Vec<(f64, f64, f64)> = rotate_points_to_south_pole(&points).unwrap();
    assert_eq!(rotated.len(), 3);
    
    let mut centroid = Vector3::zeros();
    for point in &rotated {
        centroid += Vector3::new(point.0, point.1, point.2);
    }
    centroid /= rotated.len() as f64;
    
    let centroid_norm = Unit::new_normalize(centroid);
    let south_pole = Vector3::new(0.0, 0.0, -1.0);
    println!("{}", centroid_norm.dot(&south_pole));

    // centroid should be near south pole
    assert_relative_eq!(centroid_norm.dot(&south_pole), 1.0, epsilon = 1e-10);
}

#[test]
fn test_rotate_points_to_south_pole_random_cluster() {
    let points: Vec<(f64, f64, f64)> = vec![
        (0.5, 0.5, 0.7071),
        (0.6, 0.4, 0.6928),
        (0.7, 0.3, 0.6481),
    ];
    
    let rotated: Vec<(f64, f64, f64)> = rotate_points_to_south_pole(&points).unwrap();
    assert_eq!(rotated.len(), 3);
    
    let mut original_centroid = Vector3::zeros();
    for point in &points {
        original_centroid += Vector3::new(point.0, point.1, point.2);
    }
    original_centroid /= points.len() as f64;
        
    let mut rotated_centroid = Vector3::zeros();
    for point in &rotated {
        rotated_centroid += Vector3::new(point.0, point.1, point.2);
    }
    rotated_centroid /= rotated.len() as f64;
    
    let rotated_centroid_norm = Unit::new_normalize(rotated_centroid);
    let south_pole = Vector3::new(0.0, 0.0, -1.0);
    
    // rotated centroid should be approximately at the south pole  
    assert_relative_eq!(rotated_centroid_norm.dot(&south_pole), 1.0, epsilon = 1e-10); // 1.0 because dot product of a unit vector times itself is one
    
    // rotated points should still be on the unit sphere
    for point in &rotated {
        let p = Vector3::new(point.0, point.1, point.2);
        assert_relative_eq!(p.magnitude(), 1.0, epsilon = 1e-4);
    }
}

#[test]
fn test_rotate_points_to_south_pole_evenly_distributed() {
    let points: Vec<(f64, f64, f64)> = vec![
        (1.0, 0.0, 0.0),
        (-1.0, 0.0, 0.0),
        (0.0, 1.0, 0.0),
        (0.0, -1.0, 0.0),
        (0.0, 0.0, 1.0),
        (0.0, 0.0, -1.0)
    ];
    
    // should result in an error because these points are evenly distributed
    // around the sphere, and their centroid is at the origin
    let result = rotate_points_to_south_pole(&points);
    assert!(result.is_err());
    match result {
        Err(SphereKitError::RotationError(msg)) => {
            assert_eq!(msg, "Points centroid is effectively zero; cannot determine rotation direction");
        },
        _ => panic!("Expected RotationError with a specific message"),
    }
}

#[test]
fn test_rotate_points_to_south_pole_preserves_relative_positions() {
    let points: Vec<(f64, f64, f64)> = vec![
        (0.0, 0.0, 1.0),   
        (1.0, 0.0, 0.0),   
        (0.0, 1.0, 0.0)   
    ];
    
    let rotated: Vec<(f64, f64, f64)> = rotate_points_to_south_pole(&points).unwrap();
    
    let orig_vectors: Vec<Vector3<f64>> = points.iter()
        .map(|p| Vector3::new(p.0, p.1, p.2))
        .collect();
    
    let rot_vectors: Vec<Vector3<f64>> = rotated.iter()
        .map(|p| Vector3::new(p.0, p.1, p.2))
        .collect();
    
    let angle_1_2_orig: f64 = angle_between_vectors(&orig_vectors[0], &orig_vectors[1]);
    let angle_1_3_orig: f64 = angle_between_vectors(&orig_vectors[0], &orig_vectors[2]);
    let angle_2_3_orig: f64 = angle_between_vectors(&orig_vectors[1], &orig_vectors[2]);
    
    let angle_1_2_rot: f64 = angle_between_vectors(&rot_vectors[0], &rot_vectors[1]);
    let angle_1_3_rot: f64 = angle_between_vectors(&rot_vectors[0], &rot_vectors[2]);
    let angle_2_3_rot: f64 = angle_between_vectors(&rot_vectors[1], &rot_vectors[2]);
    
    // check that angles are preserved (rotation is rigid)
    assert_relative_eq!(angle_1_2_orig, angle_1_2_rot, epsilon = 1e-10);
    assert_relative_eq!(angle_1_3_orig, angle_1_3_rot, epsilon = 1e-10);
    assert_relative_eq!(angle_2_3_orig, angle_2_3_rot, epsilon = 1e-10);
}

// function to calculate angle between two vectors
fn angle_between_vectors(v1: &Vector3<f64>, v2: &Vector3<f64>) -> f64 {
    let dot_product: f64 = v1.dot(v2);
    dot_product.clamp(-1.0, 1.0).acos()
}
