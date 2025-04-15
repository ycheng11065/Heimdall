import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await"; // needed for wasm in older browsers


// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		glsl(),
		wasm(),
		topLevelAwait(),
	],
})
