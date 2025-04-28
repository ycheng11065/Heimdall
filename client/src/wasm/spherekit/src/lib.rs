mod geometry;
mod fibonnaci;
mod polygon;
mod errors;

pub use geometry::{
    ll_to_cartesian, 
    stereographic_projection,
    rotate_points_to_south_pole
};
pub use fibonnaci::fibonacci_sphere;
pub use polygon::{get_mesh_points, generate_polygon_feature_mesh, DEFAULT_FIBONACCI_POINT_COUNT, PolygonMeshData};
pub use errors::SphereKitError;

use sgp4::{Elements, Constants};
use wasm_bindgen::prelude::*;
use js_sys;

#[wasm_bindgen]
pub fn generate_polygon_feature_mesh_wasm(geojson_feature: &str) -> Result<JsValue, JsValue> {
    let result: PolygonMeshData = generate_polygon_feature_mesh(geojson_feature)
        .map_err(|err| JsValue::from_str(&err))?;
    
    let vertices_array: js_sys::Array = js_sys::Array::new();

    for (x, y, z) in result.vertices {
        let point: js_sys::Array = js_sys::Array::new();
        point.push(&JsValue::from_f64(x));
        point.push(&JsValue::from_f64(y));
        point.push(&JsValue::from_f64(z));
        vertices_array.push(&point);
    }

    let triangles_array: js_sys::Array = js_sys::Array::new();
    for i in result.triangles {
        triangles_array.push(&JsValue::from(i));
    }
    
    let js_result: js_sys::Object = js_sys::Object::new();

    js_sys::Reflect::set(&js_result, &JsValue::from_str("vertices"), &vertices_array)?;
    js_sys::Reflect::set(&js_result, &JsValue::from_str("triangles"), &triangles_array)?;

    Ok(js_result.into())
}

#[wasm_bindgen]
pub fn compute_satellite_orbit(tle1: &str, tle2: &str, timestamp: f64) -> Result<JsValue, JsValue> {
    let elements = Elements::from_tle(None, tle1.as_bytes(), tle2.as_bytes())
        .map_err(|e| JsValue::from_str(&format!("TLE parse error: {}", e)))?;

    let constants = Constants::from_elements(&elements)
        .map_err(|e| JsValue::from_str(&format!("Constants error: {}", e)))?;

    let prediction = constants.propagate(sgp4::MinutesSinceEpoch(timestamp))
        .map_err(|e| JsValue::from_str(&format!("Constants error: {}", e)))?;

    let pos = prediction.position;
    let vec = prediction.velocity;

    let js_result = js_sys::Object::new();
    js_sys::Reflect::set(&js_result, &"position".into(), &array3(pos[0], pos[1], pos[2]))?;
    js_sys::Reflect::set(&js_result, &"velocity".into(), &array3(vec[0], vec[1], vec[2]))?;

    Ok(js_result.into())
}

#[wasm_bindgen]
pub fn generate_orbit_path(tle_line1: &str, tle_line2: &str, minutes_ahead: f64, sample_interval: f64, timestamp: f64) -> Result<JsValue, JsValue> {
    let elements = Elements::from_tle(None, tle_line1.as_bytes(), tle_line2.as_bytes())
        .map_err(|e| JsValue::from_str(&format!("TLE parse error: {}", e)))?;

    let constants = Constants::from_elements(&elements)
        .map_err(|e| JsValue::from_str(&format!("Constants error: {}", e)))?;

    let points = js_sys::Array::new();

    let num_samples = (minutes_ahead / sample_interval) as usize;

    for i in 0..num_samples {
        let minutes_since_epoch = timestamp + (i as f64 * sample_interval);
        if let Ok(prediction) = constants.propagate(sgp4::MinutesSinceEpoch(minutes_since_epoch)) {
            let pos = prediction.position;

            points.push(&array3(pos[0], pos[1], pos[2]));
        }
    }

    Ok(points.into())
}


pub fn compute_gst(julian_date: f64) -> f64 {

    // 
    let t = (julian_date - 2451545.0) / 36525.0;

    let mut gst = 280.46061837
        + 360.98564736629 * (julian_date - 2451545.0)
        + 0.000387933 * t * t
        - (t * t * t) / 38710000.0;

    gst = gst % 360.0;
    if gst < 0.0 {
        gst += 360.0;
    }

    gst.to_radians()
}

fn array3(x: f64, y: f64, z: f64) -> js_sys::Array {
    let arr = js_sys::Array::new();
    arr.push(&x.into());
    arr.push(&y.into());
    arr.push(&z.into());
    arr
}
