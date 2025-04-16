use std::fmt;
use std::error::Error;

/// Represents errors that can occur in the SphereKit library.
///
/// This enum encapsulates all possible error conditions that might arise
/// during spherical geometry operations, projections, and point generation.
#[derive(Debug, Clone, PartialEq)]
pub enum SphereKitError {
    /// Error when geographic coordinates fall outside valid ranges.
    ///
    /// Longitude must be in the range [-180, 180] degrees.
    /// Latitude must be in the range [-90, 90] degrees.
    ///
    /// # Fields
    ///
    /// * `longitude` - The invalid longitude value
    /// * `latitude` - The invalid latitude value
    CoordinateRangeError {
        longitude: f64,
        latitude: f64,
    },

    /// Error when stereographic projection cannot be performed.
    ///
    /// This typically occurs when projecting from the north pole (0, 0, 1)
    /// which is a singularity in the stereographic projection.
    ///
    /// # Fields
    ///
    /// * `0` - Detailed error message
    ProjectionError(String),

    /// Error when inverse stereographic projection inputs are invalid.
    ///
    /// This occurs when input coordinates contain NaN or infinite values.
    ///
    /// # Fields
    ///
    /// * `0` - Detailed error message
    InverseProjectionError(String),

    /// Error when generating points on a Fibonacci sphere.
    ///
    /// This can occur with invalid parameters such as negative point counts.
    ///
    /// # Fields
    ///
    /// * `0` - Detailed error message
    FibonacciError(String),

    /// Error when generating mesh points
    ///
    /// This can occur with invalid parameters such as an outer ring
    /// with not enough points.
    ///
    /// # Fields
    ///
    /// * `0` - Detailed error message
    MeshGenerationError(String),

    /// Error when point rotation cannot be determined.
    ///
    /// This typically occurs when the centroid of points is a zero vector
    /// or when the rotation axis cannot be determined.
    ///
    /// # Fields
    ///
    /// * `0` - Detailed error message
    RotationError(String),

    /// Error when attempting to use an empty set of points.
    ///
    /// # Fields
    ///
    /// * `0` - Detailed error message
    EmptyPointSetError(String),
}

impl fmt::Display for SphereKitError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SphereKitError::CoordinateRangeError { longitude, latitude } => {
                write!(
                    f,
                    "Input values outside of expected range. Longitude: {} (must be between -180 and 180), \
                     Latitude: {} (must be between -90 and 90)",
                    longitude, latitude
                )
            }
            SphereKitError::ProjectionError(msg) => {
                write!(f, "Stereographic projection error: {}", msg)
            }
            SphereKitError::InverseProjectionError(msg) => {
                write!(f, "Inverse stereographic projection error: {}", msg)
            }
            SphereKitError::FibonacciError(msg) => {
                write!(f, "Fibonacci sphere error: {}", msg)
            }
            SphereKitError::MeshGenerationError(msg) => {
                write!(f, "Mesh generation error: {}", msg)
            }
            SphereKitError::RotationError(msg) => {
                write!(f, "Point rotation error: {}", msg)
            }
            SphereKitError::EmptyPointSetError(msg) => {
                write!(f, "Empty point set error: {}", msg)
            }
        }
    }
}

impl Error for SphereKitError {}