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

use sgp4::{iau_epoch_to_sidereal_time, julian_years_since_j2000, Constants, Elements, MinutesSinceEpoch};
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

    let epoch_dt = elements.minutes_since_epoch_to_datetime(&MinutesSinceEpoch(0.0))
        .map_err(|e| JsValue::from_str(&format!("Epoch-to-datetime error: {:?}", e)))?;;

    let constants = Constants::from_elements(&elements)
        .map_err(|e| JsValue::from_str(&format!("Constants error: {}", e)))?;

    let prediction = constants.propagate(sgp4::MinutesSinceEpoch(timestamp))
        .map_err(|e| JsValue::from_str(&format!("Constants error: {}", e)))?;

    
    let prop_dt = epoch_dt + sgp4::chrono::Duration::minutes(timestamp as i64);

    let years = julian_years_since_j2000(&prop_dt);
    let gmst  = iau_epoch_to_sidereal_time(years);

    let cos_theta = gmst.cos();
    let sin_theta = gmst.sin();

    let pos = prediction.position;

    let x_teme = pos[0];
    let y_teme = pos[1];
    let z_teme = pos[2];

    let x_ecef =  cos_theta * x_teme + sin_theta * y_teme;
    let y_ecef = -sin_theta * x_teme + cos_theta * y_teme;
    let z_ecef = z_teme; // no change in Z-axis

    let position_ecef = [x_ecef, y_ecef, z_ecef];

    let js_result = js_sys::Object::new();
    js_sys::Reflect::set(&js_result, &"position".into(), &array3(position_ecef[0], position_ecef[1], position_ecef[2]))?;
    // js_sys::Reflect::set(&js_result, &"velocity".into(), &array3(vec[0], vec[1], vec[2]))?;

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

fn array3(x: f64, y: f64, z: f64) -> js_sys::Array {
    let arr = js_sys::Array::new();
    arr.push(&x.into());
    arr.push(&y.into());
    arr.push(&z.into());
    arr
}
