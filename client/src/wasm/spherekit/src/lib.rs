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
pub use polygon::{get_mesh_points, handle_polygon_feature, DEFAULT_FIBONACCI_POINT_COUNT, PolygonMeshData};
pub use errors::SphereKitError;

use wasm_bindgen::prelude::*;
use js_sys;

#[wasm_bindgen]
pub fn handle_polygon_feature_wasm(geojson_feature: &str) -> Result<JsValue, JsValue> {
    let result: PolygonMeshData = handle_polygon_feature(geojson_feature)
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
