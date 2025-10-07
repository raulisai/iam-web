import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	
	kit: {
		adapter: adapter({
			// Opciones para adapter-node
			out: 'build',
			precompress: false,
			envPrefix: ''
		})
	},
	
	// Desactivar warnings de accesibilidad para permitir el build
	onwarn: (warning, handler) => {
		if (warning.code === 'a11y-label-has-associated-control') return;
		handler(warning);
	}
};

export default config;
