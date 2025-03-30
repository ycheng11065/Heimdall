uniform sampler2D textureMap;
uniform vec3 baseColor;
varying vec2 vUv;

void main() {
    // Define the region where we want to apply the texture
    if (vUv.x > 0.25 && vUv.x < 0.75 && vUv.y > 0.25 && vUv.y < 0.75) {
        // Remap the UVs to use the full texture in this smaller area
        vec2 remappedUV = (vUv - vec2(0.25, 0.25)) / vec2(0.5, 0.5);
        gl_FragColor = texture2D(textureMap, remappedUV);
    } else {
        gl_FragColor = vec4(baseColor, 1.0);
    }
}