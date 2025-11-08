<!-- src/routes/docs/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { BookOpen, Sparkles, AlertCircle, CheckCircle } from '@lucide/svelte';
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

<div
	class="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
>
	<!-- Enhanced Header -->
	<div class="border-b bg-background/95 shadow-sm backdrop-blur-sm">
		<div class="container mx-auto px-4 py-8">
			<div class="flex items-center justify-between">
				<div>
					<div
						class="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm"
					>
						<Sparkles class="h-3 w-3 text-primary" />
						<span class="font-medium text-primary">API Reference</span>
					</div>
					<h1 class="text-4xl font-bold">API Documentation</h1>
					<p class="mt-2 text-base text-muted-foreground">
						Interactive OpenAPI documentation for HiveCrawl's scraping, crawling, and search
						endpoints
					</p>
				</div>
				<Badge
					variant="secondary"
					class="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
				>
					<BookOpen class="mr-1 h-3 w-3" />
					OpenAPI 3.0
				</Badge>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8">
		<!-- Debug Status Messages -->
		{#if spec}
			<div
				class="mb-6 rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/20"
			>
				<div class="flex items-center gap-2">
					<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
					<strong class="text-green-900 dark:text-green-100">Spec Loaded Successfully</strong>
				</div>
				<p class="mt-1 ml-7 text-sm text-green-700 dark:text-green-300">
					Found {Object.keys(spec.paths || {}).length} API endpoint{Object.keys(spec.paths || {})
						.length !== 1
						? 's'
						: ''}
				</p>
			</div>
		{:else}
			<div
				class="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20"
			>
				<div class="flex items-center gap-2">
					<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
					<strong class="text-red-900 dark:text-red-100">Loading Spec...</strong>
				</div>
				<p class="mt-1 ml-7 text-sm text-red-700 dark:text-red-300">
					If this persists, check that the OpenAPI spec file is available
				</p>
			</div>
		{/if}

		<!-- Swagger UI Container -->
		<Card.Root class="overflow-hidden border-2 shadow-xl">
			<div id="swagger-ui-container" class="min-h-[600px] p-8" bind:this={containerElement}></div>
		</Card.Root>
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
