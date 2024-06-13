import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// const env = loadEnv(mode, process.dirname)
	return {
		plugins: [svelte(), nodePolyfills(),],
		build: {
			sourcemap: true,
		},
	}
})
