mod geometry;
mod fibonnaci;
mod polygon;
mod errors;

pub use geometry::{ll_to_cartesian, stereographic_projection, inverse_stereographic_projection};
pub use fibonnaci::fibonacci_sphere;
pub use polygon::{get_mesh_points, handle_polygon_feature, DEFAULT_FIBONACCI_POINT_COUNT};
pub use errors::SphereKitError;

use wasm_bindgen::prelude::*;
use js_sys;

#[wasm_bindgen]
pub fn handle_polygon_feature_wasm(geojson_feature: &str) -> Result<JsValue, JsValue> {
    let result: Vec<(f64, f64, f64)> = handle_polygon_feature(geojson_feature)
        .map_err(|err| JsValue::from_str(&err))?;
    
    let js_array: js_sys::Array = js_sys::Array::new();

    for (x, y, z) in result {
        let point: js_sys::Array = js_sys::Array::new();
        point.push(&JsValue::from_f64(x));
        point.push(&JsValue::from_f64(y));
        point.push(&JsValue::from_f64(z));
        js_array.push(&point);
    }
    
    Ok(js_array.into())
}
