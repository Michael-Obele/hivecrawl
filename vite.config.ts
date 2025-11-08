import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import openapiPlugin from 'sveltekit-openapi-generator';

export default defineConfig({
	plugins: [
		tailwindcss(),
		openapiPlugin({
			info: {
				title: 'HiveCrawl API',
				version: '1.0.0',
				description: 'Web scraping and search API for extracting content from websites'
			},
			servers: [
				{
					url: 'http://localhost:5173',
					description: 'Development server'
				}
			],
			outputPath: 'static/openapi.json',
			debounceMs: 100
		}),
		sveltekit()
	]
});
