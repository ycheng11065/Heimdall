use d3_geo_rs::polygon_contains::polygon_contains;
use geo_types::{coord, Coord, LineString};
use geojson::{Feature, GeoJson, Geometry, PolygonType, Value};
use ghx_constrained_delaunay::{
    constrained_triangulation_from_2d_vertices, 
    types::Edge, Triangulation,
    constrained_triangulation::ConstrainedTriangulationConfiguration,
};
use crate::{
    fibonacci_sphere, 
    geometry::Point2D, 
    ll_to_cartesian, 
    rotate_points_to_south_pole, 
    stereographic_projection, 
    SphereKitError
};

/*********************************/
/*   Constants and definitions   */
/*********************************/


/// The default number of points to generate in a Fibonacci sphere distribution
pub const DEFAULT_FIBONACCI_POINT_COUNT: usize = 3000;

/// Represents the geometric data for a triangulated polygon mesh on a sphere.
///
/// This structure stores both the vertices (as 3D Cartesian coordinates) and the triangulation
/// information that defines the mesh. The triangles are represented as indices into the vertices array.
///
/// # Fields
///
/// * `vertices` - 3D points forming the mesh in Cartesian coordinates (x, y, z).
///   Each vertex is a tuple of (f64, f64, f64) representing a point on a unit sphere.
///
/// * `triangles` - Triangle indices for the mesh, flattened as [i1, i2, i3, j1, j2, j3, ...].
///   Each consecutive triplet of indices defines one triangle by referencing vertices in the
///   `vertices` field.
#[derive(Debug, Clone)]
pub struct PolygonMeshData {
    /// 3D points forming the mesh (x, y, z coordinates)
    pub vertices: Vec<(f64, f64, f64)>,
    
    /// Triangle indices for the mesh, flattened as [i1, i2, i3, j1, j2, j3, ...]
    pub triangles: Vec<u32>,
}

/*********************************/
/*           Functions           */
/*********************************/


pub fn handle_polygon_feature(geojson_feature: &str) -> Result<PolygonMeshData, String> {

    let geojson: GeoJson = geojson_feature.parse::<GeoJson>()
        .map_err(|err| format!("Failed to parse GeoJSON: {}", err))?;
    
    let feature: Feature = Feature::try_from(geojson)
        .map_err(|err| format!("Failed to convert to Feature: {}", err))?;

    let geometry: Geometry = feature.geometry.unwrap(); // parser would've caught if none

    let polygon: PolygonType = match geometry.value {
        Value::Polygon(polygon) => polygon,
        _ => return Err("Expected a polygon".to_string())
    };

    if polygon.is_empty() { return Err("Polygon is empty".to_string()); }

    let outer_ring: Vec<(f64, f64)> = polygon[0]
        .iter()
        .map(|point| (point[0], point[1]))
        .collect();

    let mesh_points: Vec<(f64, f64, f64)> = get_mesh_points(&outer_ring)
        .map_err(|err| format!("Failed to generate mesh points: {}", err))?;

    // calculate edges for outer ring
    let mut edges: Vec<Edge> = Vec::with_capacity(outer_ring.len());
    for i in (0..outer_ring.len()).rev() {
        let edge: Edge = Edge {
            from: i as u32,
            to: ((i + outer_ring.len() - 1) % outer_ring.len()) as u32
        };
        edges.push(edge);
    }

    // rotate points to south pole for better stereographic projection
    let rotated_points: Vec<(f64, f64, f64)> = rotate_points_to_south_pole(&mesh_points)
        .map_err(|err| format!("Failed to rotate points to south pole: {}", err))?;

    // do a stereographic projection
    let mut projected_points: Vec<Point2D> = Vec::with_capacity(rotated_points.len());
    for point in rotated_points {
        let projected_point: (f64, f64) = stereographic_projection(point)
            .map_err(|err| format!("Failed to project points: {}", err))?;
        let projected_point: Point2D = Point2D { x: projected_point.0, y: projected_point.1 };
        projected_points.push(projected_point);
    }
    

    let config: ConstrainedTriangulationConfiguration = ConstrainedTriangulationConfiguration {
        bin_vertex_density_power: 1.0,
    };

    // generate mesh triangles using constrained delaunay triangulation
    let delaunay_triangles: Triangulation = constrained_triangulation_from_2d_vertices(&projected_points, &edges, config)
        .map_err(|err| format!("Failed to generate triangulation: {}", err))?;

    let flattened_delaunay: Vec<u32> = delaunay_triangles.triangles.into_iter()
        .flat_map(|triangle| triangle.into_iter())
        .collect();
    
    Ok(PolygonMeshData {
        vertices: mesh_points,
        triangles: flattened_delaunay
    })
}

/// Generates a set of 3D mesh points from a geographic polygon by combining the polygon's
/// boundary points with interior points generated using a Fibonacci sphere distribution.
///
/// This function takes an outer ring of a polygon defined by longitude and latitude coordinates,
/// fills it with points from a Fibonacci sphere distribution, and converts all points to 3D
/// Cartesian coordinates on a unit sphere.
///
/// # Arguments
///
/// * `outer_ring` - A vector of (longitude, latitude) pairs in decimal degrees that define the boundary
///                 of the polygon. Longitude should be in the range [-180, 180] and latitude in [-90, 90].
///
/// # Returns
///
/// * `Ok(Vec<(f64, f64, f64)>)` - A vector of 3D Cartesian coordinates representing the mesh points
///                                (both boundary and interior)
/// * `Err(String)` - An error message if the mesh generation cannot be performed
///
/// # Examples
///
/// ```
/// use spherekit::get_mesh_points;
/// 
/// // Define the boundary of a simple polygon (a triangle near the equator)
/// let polygon = vec![
///     (0.0, 0.0),    // (longitude, latitude) in decimal degrees
///     (5.0, 5.0),
///     (10.0, 0.0)
/// ];
/// 
/// match get_mesh_points(&polygon) {
///     Ok(mesh_points) => println!("Generated {} mesh points", mesh_points.len()),
///     Err(e) => println!("Error: {}", e),
/// }
/// ```
///
/// # Note
///
/// The function requires at least 3 points in the outer ring to form a valid polygon.
/// It uses a Fibonacci sphere distribution to generate approximately 2000 evenly distributed
/// points, then filters to keep only those inside the polygon boundary.
pub fn get_mesh_points(outer_ring: &Vec<(f64, f64)>) -> Result<Vec<(f64, f64, f64)>, SphereKitError> {
    if outer_ring.is_empty() {
        return Err(SphereKitError::EmptyPointSetError("Outer ring cannot be empty".to_string()));
    }

    if outer_ring.len() < 3 {
        return Err(SphereKitError::MeshGenerationError("Outer ring must have at least 3 points to form a valid polygon".to_string()));
    }

    let outer_ring_coord: Vec<Coord<f64>> = outer_ring
        .iter()
        .map(|point| coord! { x: point.0.to_radians(), y: point.1.to_radians() })
        .collect();
    
    let outer_ring_linestring: [LineString<f64>; 1] = [LineString(outer_ring_coord)];

    // get fibonacci points
    let fibonacci_points: Vec<(f64, f64)> = fibonacci_sphere(DEFAULT_FIBONACCI_POINT_COUNT)?;

    let mut mesh_points_2d: Vec<(f64, f64)> = outer_ring.clone();

    for point in fibonacci_points {
        let coord: Coord<f64> = coord! { x: point.0, y: point.1 };

        // keep fibonacci points which are contained in the shape
        if polygon_contains(&outer_ring_linestring, &coord) {
            mesh_points_2d.push((coord.x.to_degrees(), coord.y.to_degrees()));
        }
    }

    let mut mesh_points_3d: Vec<(f64, f64, f64)> = Vec::new();
    for point in mesh_points_2d {
        let point_3d: (f64, f64, f64) = ll_to_cartesian(point.0, point.1)?;
        mesh_points_3d.push(point_3d);
    }

    Ok(mesh_points_3d) 
}