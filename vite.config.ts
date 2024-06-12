import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// const env = loadEnv(mode, process.dirname)
	return {
		define: {
			// 'process.env.VITE_CAPSULE_API_KEY': JSON.stringify(env.VITE_CAPSULE_API_KEY),
			'process.env': {}
		},
		plugins: [svelte()],
		build: {
			sourcemap: true,
		},
	}
})
