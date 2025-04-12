use spherekit::handle_polygon_feature;


#[test]
fn test_valid_polygon() {
    let geojson_feature: &str = r#"{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ]
            ]
        },
        "properties": {}
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_ok());
}

#[test]
fn test_valid_polygon_with_holes() {
    let geojson_feature: &str = 
    r#"{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ],
                [
                    [100.2, 0.2],
                    [100.8, 0.2],
                    [100.8, 0.8],
                    [100.2, 0.8],
                    [100.2, 0.2]
                ]
            ]
        },
        "properties": {}
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_ok());
}

#[test]
fn test_invalid_json() {
    let geojson_feature: &str = 
    r#"{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [100.0, 0.0],
                    [101.0, 0.0],
                    [101.0, 1.0],
                    [100.0, 1.0],
                    [100.0, 0.0]
                ]
            ]
        "properties": {}
    }"#;  // Missing closing brace
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Failed to parse GeoJSON"));
}

#[test]
fn test_not_a_feature() {
    let geojson_feature: &str = 
    r#"{
        "type": "FeatureCollection",
        "features": []
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Failed to convert to Feature"));
}

#[test]
fn test_missing_geometry() {
    let geojson_feature: &str = 
    r#"{
        "type": "Feature",
        "properties": {}
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Geometry is missing from feature"));
}

#[test]
fn test_non_polygon_geometry() {
    let geojson_feature: &str = 
    r#"{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [100.0, 0.0]
        },
        "properties": {}
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Expected a polygon"));
}

#[test]
fn test_empty_polygon() {
    let geojson_feature: &str = 
    r#"{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": []
        },
        "properties": {}
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_ok());
}

// This test may fail if your function requires at least one valid ring
#[test]
fn test_polygon_with_empty_ring() {
    let geojson_feature: &str = 
    r#"{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[]]
        },
        "properties": {}
    }"#;
    
    let result = handle_polygon_feature(geojson_feature);
    assert!(result.is_ok());
}