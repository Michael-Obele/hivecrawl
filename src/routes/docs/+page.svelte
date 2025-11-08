<!-- src/routes/docs/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	// spec may be provided by Vite via virtual:openapi-spec — we'll try to load it at runtime and
	// fall back to fetching '/openapi-spec.json' when not available.
	import 'swagger-ui-dist/swagger-ui.css';

	let containerElement: HTMLElement | undefined;
	let spec: any = $state();

	// Get the current server URL reactively
	let currentOrigin = $derived(page.url.origin);

	// Create a modified spec with the current server URL
	let specWithServer = $derived({
		...spec,
		servers: [
			{
				url: currentOrigin,
				description: dev ? 'Development server' : 'Production server'
			}
		]
	});

	// Debug helpers (will log after spec is loaded)

	onMount(async () => {
		if (!containerElement) {
			console.error('Container element not found!');
			return;
		}

		try {
			// Attempt to load a virtual spec module (Vite plugin) first
			try {
				// @ts-ignore - virtual import may not exist in all environments
				const virtualSpec = await import('virtual:openapi-spec');
				spec = virtualSpec?.default ?? virtualSpec;
			} catch (e) {
				// Fallback: fetch the openapi spec from the dev middleware
				try {
					const res = await fetch('/openapi-spec.json');
					if (res.ok) spec = await res.json();
					else spec = { openapi: '3.0.0', info: { title: 'HiveCrawl API' }, paths: {} };
				} catch (fetchErr) {
					console.warn('Could not load virtual spec or fetch /openapi-spec.json', fetchErr);
					spec = { openapi: '3.0.0', info: { title: 'HiveCrawl API' }, paths: {} };
				}
			}

			// Log loaded spec info
			console.log('Loaded spec:', spec);
			console.log('Spec paths:', spec.paths);
			console.log('Path count:', Object.keys(spec.paths || {}).length);

			// @ts-ignore - swagger-ui-dist doesn't have types
			const { SwaggerUIBundle, SwaggerUIStandalonePreset } = await import('swagger-ui-dist');

			console.log('Initializing Swagger UI with spec:', specWithServer);

			SwaggerUIBundle({
				spec: specWithServer,
				domNode: containerElement,
				deepLinking: true,
				presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
			});

			console.log('Swagger UI initialized');
		} catch (error) {
			console.error('Failed to initialize Swagger UI:', error);
		}
	});
</script>

<svelte:head>
	<title>API Documentation - HiveCrawl</title>
	<meta
		name="description"
		content="Interactive API documentation for HiveCrawl web scraping and search APIs"
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<div class="container mx-auto px-4 py-8">
		<header
			class="bg-linear-to-br from-indigo-600 via-purple-600 to-purple-700 px-4 py-8 text-center text-white shadow-lg dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900"
		>
			<h1 class="mb-2 text-4xl font-bold">API Documentation</h1>
			<p class="text-lg opacity-90">Explore and test the API endpoints</p>
		</header>

		<!-- Debug: Show if spec is loaded -->
		{#if spec}
			<div
				class="m-4 rounded border-l-4 border-cyan-500 bg-cyan-50 p-4 dark:border-cyan-600 dark:bg-cyan-950"
			>
				<strong class="text-cyan-900 dark:text-cyan-100">Debug:</strong>
				<span class="text-cyan-700 dark:text-cyan-300">
					Spec loaded with {Object.keys(spec.paths || {}).length} paths
				</span>
			</div>
		{:else}
			<div
				class="m-4 rounded border-l-4 border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-950"
			>
				<strong class="text-red-900 dark:text-red-100">Error:</strong>
				<span class="text-red-700 dark:text-red-300">No spec loaded</span>
			</div>
		{/if}

		<div id="swagger-ui-container" class="mx-auto max-w-7xl p-8" bind:this={containerElement}></div>
	</div>
</div>

<style>
	/* Override some Swagger UI styles for better integration */
	:global(.swagger-ui .topbar) {
		display: none;
	}

	:global(.swagger-ui .information-container) {
		margin: 2rem 0;
	}

	/* Dark mode support for Swagger UI */
	:global(.dark .swagger-ui) {
		filter: invert(0.9) hue-rotate(180deg);
	}

	:global(.dark .swagger-ui .opblock-tag) {
		filter: invert(0.9) hue-rotate(180deg);
	}
</style>
