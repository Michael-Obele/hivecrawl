<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		Search,
		Bot,
		Rocket,
		Heart,
		BookOpen,
		Github,
		Sparkles,
		Globe,
		Zap
	} from '@lucide/svelte';

	let activeTab = $state('scrape');
	let scrapeUrl = $state('');
	let scrapeFormat = $state('markdown');
	let scrapeResult = $state<any>(null);
	let scrapeLoading = $state(false);

	let crawlUrl = $state('');
	let crawlMaxPages = $state(10);
	let crawlMaxDepth = $state(2);
	let crawlResult = $state<any>(null);
	let crawlLoading = $state(false);

	let searchQuery = $state('');
	let searchLimit = $state(10);
	let searchResult = $state<any>(null);
	let searchLoading = $state(false);

	async function handleScrape(event?: Event) {
		if (event && 'preventDefault' in event) event.preventDefault();

		if (!scrapeUrl.trim()) return;

		scrapeLoading = true;
		scrapeResult = null;

		try {
			const response = await fetch('/api/scrape', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: scrapeUrl,
					format: scrapeFormat
				})
			});

			const data = await response.json();
			scrapeResult = data;
		} catch (error) {
			scrapeResult = { error: error instanceof Error ? error.message : 'Unknown error' };
		} finally {
			scrapeLoading = false;
		}
	}

	async function handleCrawl(event?: Event) {
		if (event && 'preventDefault' in event) event.preventDefault();

		if (!crawlUrl.trim()) return;

		crawlLoading = true;
		crawlResult = null;

		try {
			const response = await fetch('/api/crawl', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: crawlUrl,
					maxPages: crawlMaxPages,
					maxDepth: crawlMaxDepth
				})
			});

			const data = await response.json();
			console.log('Crawl API response:', data);
			crawlResult = data;
		} catch (error) {
			crawlResult = { error: error instanceof Error ? error.message : 'Unknown error' };
		} finally {
			crawlLoading = false;
		}
	}

	async function handleSearch(event?: Event) {
		if (event && 'preventDefault' in event) event.preventDefault();

		if (!searchQuery.trim()) return;

		searchLoading = true;
		searchResult = null;

		try {
			const response = await fetch(
				`/api/search?q=${encodeURIComponent(searchQuery)}&limit=${searchLimit}`
			);
			const data = await response.json();
			console.log('Search API response:', data);
			searchResult = data;
		} catch (error) {
			searchResult = { error: error instanceof Error ? error.message : 'Unknown error' };
		} finally {
			searchLoading = false;
		}
	}
</script>

<svelte:head>
	<title>HiveCrawl - Web Scraping & Search API</title>
	<meta name="description" content="Powerful web scraping and search APIs for developers" />
</svelte:head>

<div
	class="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
>
	<!-- Hero Header -->
	<header
		class="relative overflow-hidden bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-16 text-center text-white shadow-2xl dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900"
	>
		<div
			class="bg-grid-white/10 absolute inset-0 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"
		></div>
		<div class="relative">
			<div
				class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
			>
				<Sparkles class="h-4 w-4" />
				<span class="text-sm font-medium">Powered by AI & Modern Web Tech</span>
			</div>
			<h1 class="mb-6 text-6xl font-extrabold tracking-tight drop-shadow-lg md:text-7xl">
				🐝 HiveCrawl
			</h1>
			<p class="mx-auto max-w-2xl text-xl leading-relaxed opacity-95">
				Professional web scraping and search APIs built for developers. Extract data, crawl
				websites, and search the web with lightning-fast performance.
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-4">
				<Button
					href="/docs"
					size="lg"
					class="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
				>
					<BookOpen class="mr-2 h-5 w-5" />
					API Documentation
				</Button>
				<Button
					href="https://github.com/Michael-Obele/hivecrawl"
					target="_blank"
					size="lg"
					variant="outline"
					class="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
				>
					<Github class="mr-2 h-5 w-5" />
					View on GitHub
				</Button>
			</div>

			<!-- Feature Badges -->
			<div class="mt-10 flex flex-wrap justify-center gap-3">
				<Badge variant="secondary" class="bg-white/20 px-3 py-1.5 text-white backdrop-blur-sm">
					<Zap class="mr-1 h-3 w-3" />
					Fast & Reliable
				</Badge>
				<Badge variant="secondary" class="bg-white/20 px-3 py-1.5 text-white backdrop-blur-sm">
					<Globe class="mr-1 h-3 w-3" />
					Unlimited Endpoints
				</Badge>
				<Badge variant="secondary" class="bg-white/20 px-3 py-1.5 text-white backdrop-blur-sm">
					<Rocket class="mr-1 h-3 w-3" />
					Production Ready
				</Badge>
			</div>
		</div>
	</header>

	<main class="container mx-auto px-4 py-16">
		<div class="mx-auto max-w-5xl">
			<!-- Tab Navigation using shadcn Tabs -->
			<Tabs.Root bind:value={activeTab} class="w-full">
				<Tabs.List class="mb-10 grid w-full grid-cols-3 bg-muted/50 p-1.5">
					<Tabs.Trigger
						value="scrape"
						class="data-[state=active]:bg-background data-[state=active]:shadow-md"
					>
						<Search class="mr-2 h-4 w-4" />
						Scrape Page
					</Tabs.Trigger>
					<Tabs.Trigger
						value="crawl"
						class="data-[state=active]:bg-background data-[state=active]:shadow-md"
					>
						<Bot class="mr-2 h-4 w-4" />
						Crawl Site
					</Tabs.Trigger>
					<Tabs.Trigger
						value="search"
						class="data-[state=active]:bg-background data-[state=active]:shadow-md"
					>
						<Globe class="mr-2 h-4 w-4" />
						Search Web
					</Tabs.Trigger>
				</Tabs.List>

				<!-- Scrape Tab -->
				<Tabs.Content value="scrape" class="mt-0">
					<Card.Root class="border-2 shadow-xl transition-shadow hover:shadow-2xl">
						<Card.Header class="space-y-2 pb-6">
							<div class="flex items-center justify-between">
								<Card.Title class="text-3xl font-bold">Scrape a Webpage</Card.Title>
								<Badge
									variant="secondary"
									class="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
								>
									<Rocket class="mr-1 h-3 w-3" />
									Fast
								</Badge>
							</div>
							<Card.Description class="text-base">
								Extract content from any webpage in multiple formats including markdown, HTML, and
								JSON. Perfect for data extraction and content analysis.
							</Card.Description>
						</Card.Header>
						<Separator />
						<Card.Content class="space-y-6 pt-6">
							<form onsubmit={handleScrape} class="space-y-6">
								<div class="space-y-3">
									<Label for="scrape-url" class="text-base font-semibold">URL to scrape</Label>
									<Input
										id="scrape-url"
										type="url"
										bind:value={scrapeUrl}
										placeholder="https://example.com"
										required
										class="h-12 text-base"
									/>
								</div>

								<div class="space-y-3">
									<Label for="scrape-format" class="text-base font-semibold">Output format</Label>
									<Select.Root type="single" bind:value={scrapeFormat}>
										<Select.Trigger class="h-12 w-full text-base">
											{scrapeFormat === 'markdown'
												? 'Markdown'
												: scrapeFormat === 'html'
													? 'HTML'
													: scrapeFormat === 'json'
														? 'JSON'
														: 'Select format'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="markdown" label="Markdown">Markdown</Select.Item>
											<Select.Item value="html" label="HTML">HTML</Select.Item>
											<Select.Item value="json" label="JSON">JSON</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>

								<Button
									type="submit"
									disabled={scrapeLoading}
									class="h-12 w-full bg-linear-to-r from-blue-600 to-indigo-600 text-base font-semibold hover:from-blue-700 hover:to-indigo-700"
								>
									{#if scrapeLoading}
										<span class="flex items-center justify-center">
											<svg
												class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													class="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													stroke-width="4"
												></circle>
												<path
													class="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Scraping...
										</span>
									{:else}
										<Rocket class="mr-2 h-5 w-5" />
										Scrape Page
									{/if}
								</Button>
							</form>

							{#if scrapeResult}
								<div class="mt-8 space-y-4">
									<div class="flex items-center justify-between">
										<h3 class="text-xl font-semibold">Result</h3>
										<Badge variant="outline" class="font-mono">
											{scrapeFormat.toUpperCase()}
										</Badge>
									</div>
									<Separator />
									<div
										class="max-h-96 overflow-y-auto rounded-xl border-2 bg-slate-50 p-6 dark:bg-slate-900"
									>
										{#if scrapeResult.error}
											<div class="flex items-center gap-2 text-red-600 dark:text-red-400">
												<span class="font-semibold">Error:</span>
												<span>{scrapeResult.error}</span>
											</div>
										{:else}
											<div class="space-y-4">
												<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
													<div
														class="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-400"
													>
														Title
													</div>
													<div class="font-medium">{scrapeResult.data?.title || 'No title'}</div>
												</div>
												<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
													<div
														class="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-400"
													>
														URL
													</div>
													<div class="truncate font-mono text-sm text-blue-600 dark:text-blue-400">
														{scrapeResult.data?.url}
													</div>
												</div>
												{#if scrapeFormat === 'markdown'}
													<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
														<div
															class="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400"
														>
															Content (Markdown)
														</div>
														<pre
															class="max-h-64 overflow-auto rounded border bg-slate-50 p-3 text-sm whitespace-pre-wrap dark:bg-slate-950">{scrapeResult
																.data?.markdown}</pre>
													</div>
												{:else if scrapeFormat === 'html'}
													<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
														<div
															class="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400"
														>
															Content (HTML)
														</div>
														<pre
															class="max-h-64 overflow-auto rounded border bg-slate-50 p-3 text-sm whitespace-pre-wrap dark:bg-slate-950">{scrapeResult
																.data?.html}</pre>
													</div>
												{:else}
													<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
														<div
															class="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400"
														>
															Content
														</div>
														<pre
															class="max-h-64 overflow-auto rounded border bg-slate-50 p-3 text-sm whitespace-pre-wrap dark:bg-slate-950">{JSON.stringify(
																scrapeResult.data?.content,
																null,
																2
															)}</pre>
													</div>
												{/if}
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<!-- Crawl Tab -->
				<Tabs.Content value="crawl" class="mt-0">
					<Card.Root class="border-2 shadow-xl transition-shadow hover:shadow-2xl">
						<Card.Header class="space-y-2 pb-6">
							<div class="flex items-center justify-between">
								<Card.Title class="text-3xl font-bold">Crawl a Website</Card.Title>
								<Badge
									variant="secondary"
									class="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
								>
									<Bot class="mr-1 h-3 w-3" />
									Advanced
								</Badge>
							</div>
							<Card.Description class="text-base">
								Crawl an entire website starting from a URL. Follows links automatically and
								extracts content from multiple pages with customizable depth and limits.
							</Card.Description>
						</Card.Header>
						<Separator />
						<Card.Content class="space-y-6 pt-6">
							<form onsubmit={handleCrawl} class="space-y-6">
								<div class="space-y-3">
									<Label for="crawl-url" class="text-base font-semibold">Starting URL</Label>
									<Input
										id="crawl-url"
										type="url"
										bind:value={crawlUrl}
										placeholder="https://example.com"
										required
										class="h-12 text-base"
									/>
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-3">
										<Label for="max-pages" class="text-base font-semibold">Max Pages</Label>
										<div class="relative">
											<Input
												id="max-pages"
												type="number"
												min="1"
												max="50"
												bind:value={crawlMaxPages}
												class="h-12 text-base"
											/>
											<div
												class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground"
											>
												1-50
											</div>
										</div>
									</div>

									<div class="space-y-3">
										<Label for="max-depth" class="text-base font-semibold">Max Depth</Label>
										<div class="relative">
											<Input
												id="max-depth"
												type="number"
												min="1"
												max="3"
												bind:value={crawlMaxDepth}
												class="h-12 text-base"
											/>
											<div
												class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground"
											>
												1-3
											</div>
										</div>
									</div>
								</div>

								<Button
									type="submit"
									disabled={crawlLoading}
									class="h-12 w-full bg-linear-to-r from-purple-600 to-pink-600 text-base font-semibold hover:from-purple-700 hover:to-pink-700"
								>
									{#if crawlLoading}
										<span class="flex items-center justify-center">
											<svg
												class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													class="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													stroke-width="4"
												></circle>
												<path
													class="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Crawling...
										</span>
									{:else}
										<Bot class="mr-2 h-5 w-5" />
										Start Crawling
									{/if}
								</Button>
							</form>

							{#if crawlResult}
								<div class="mt-8 space-y-4">
									<div class="flex items-center justify-between">
										<h3 class="text-xl font-semibold">Crawl Results</h3>
										{#if crawlResult.data?.metadata?.totalPages}
											<Badge
												class="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
											>
												{crawlResult.data.metadata.totalPages} pages found
											</Badge>
										{/if}
									</div>
									<Separator />
									<div
										class="max-h-96 overflow-y-auto rounded-xl border-2 bg-slate-50 p-6 dark:bg-slate-900"
									>
										{#if crawlResult.error}
											<div class="flex items-center gap-2 text-red-600 dark:text-red-400">
												<span class="font-semibold">Error:</span>
												<span>{crawlResult.error}</span>
											</div>
										{:else}
											<div class="space-y-4">
												<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
													<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
														<div
															class="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-400"
														>
															Pages Crawled
														</div>
														<div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
															{crawlResult.data?.metadata?.totalPages || 0}
														</div>
													</div>
													<div class="rounded-lg bg-white p-4 dark:bg-slate-800">
														<div
															class="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-400"
														>
															Total Time
														</div>
														<div class="text-2xl font-bold text-pink-600 dark:text-pink-400">
															{crawlResult.data?.metadata?.totalTime
																? `${(crawlResult.data.metadata.totalTime / 1000).toFixed(2)}s`
																: 'N/A'}
														</div>
													</div>
												</div>

												<div class="space-y-2">
													<div class="text-sm font-semibold text-slate-600 dark:text-slate-400">
														Discovered Pages
													</div>
													<div class="max-h-64 space-y-3 overflow-y-auto">
														{#each crawlResult.data?.pages || [] as page, i}
															<div
																class="group rounded-lg border-2 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:bg-slate-800 dark:hover:border-purple-700"
															>
																<div class="flex items-start justify-between gap-3">
																	<div class="flex-1 space-y-1">
																		<div class="font-semibold text-slate-900 dark:text-slate-100">
																			{page.title || 'No title'}
																		</div>
																		<div
																			class="truncate font-mono text-sm text-blue-600 dark:text-blue-400"
																		>
																			{page.url}
																		</div>
																	</div>
																	<Badge variant="outline" class="shrink-0">
																		Depth: {page.depth}
																	</Badge>
																</div>
															</div>
														{/each}
													</div>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<!-- Search Tab -->
				<Tabs.Content value="search" class="mt-0">
					<Card.Root
						class="mx-auto w-full max-w-4xl border-2 shadow-xl transition-shadow hover:shadow-2xl"
					>
						<Card.Header class="space-y-2 pb-6">
							<div class="flex items-center justify-between">
								<Card.Title class="text-3xl font-bold">Search the Web</Card.Title>
								<Badge
									variant="secondary"
									class="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
								>
									<Globe class="mr-1 h-3 w-3" />
									Real-time
								</Badge>
							</div>
							<Card.Description class="text-base">
								Search the web using DuckDuckGo. Get relevant results instantly.
							</Card.Description>
							<Separator class="mt-4!" />
						</Card.Header>
						<Card.Content class="space-y-6">
							<form onsubmit={handleSearch} class="space-y-6">
								<div class="space-y-2">
									<Label for="search-query">Search query</Label>
									<Input
										id="search-query"
										type="text"
										bind:value={searchQuery}
										placeholder="What are you looking for?"
										required
										class="h-12 text-base"
									/>
								</div>

								<div class="space-y-2">
									<Label for="search-limit">
										Max results
										<span class="ml-1 text-xs text-muted-foreground">(1-50)</span>
									</Label>
									<Input
										id="search-limit"
										type="number"
										min="1"
										max="50"
										bind:value={searchLimit}
										class="h-12"
									/>
								</div>

								<Button
									type="submit"
									disabled={searchLoading}
									class="h-12 w-full bg-linear-to-r from-green-600 to-teal-600 text-base font-semibold hover:from-green-700 hover:to-teal-700"
								>
									{#if searchLoading}
										<Zap class="mr-2 h-4 w-4 animate-pulse" />
										Searching...
									{:else}
										<Search class="mr-2 h-4 w-4" />
										Search Web
									{/if}
								</Button>
							</form>

							{#if searchResult}
								<Separator class="my-6" />
								<div class="space-y-4">
									<div class="flex items-center justify-between">
										<h3 class="text-xl font-semibold">Search Results</h3>
										{#if searchResult.data?.results}
											<Badge variant="secondary">
												{searchResult.data.results.length} results
											</Badge>
										{/if}
									</div>
									<div class="max-h-96 space-y-3 overflow-y-auto rounded-xl bg-muted/50 p-4">
										{#if searchResult.error}
											<div
												class="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-950/20 dark:text-red-400"
											>
												<p class="font-medium">Error: {searchResult.error}</p>
											</div>
										{:else}
											{#each searchResult.data?.results || [] as result}
												<div
													class="group rounded-xl border-2 bg-card p-4 transition-all hover:border-green-500 hover:shadow-md"
												>
													<h4 class="font-semibold text-green-600 dark:text-green-400">
														<a
															href={result.url}
															target="_blank"
															rel="noopener noreferrer"
															class="hover:underline"
														>
															{result.title}
														</a>
													</h4>
													<p class="mt-2 text-sm text-muted-foreground">
														{result.snippet}
													</p>
													<div class="mt-2 truncate text-xs text-muted-foreground/70">
														{result.url}
													</div>
												</div>
											{/each}
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</main>

	<footer
		class="border-t bg-linear-to-br from-slate-100 to-blue-50 py-12 dark:from-slate-900 dark:to-slate-950"
	>
		<div class="container mx-auto px-4">
			<div class="grid gap-8 md:grid-cols-3">
				<div>
					<h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
						<Rocket class="h-5 w-5" />
						HiveCrawl
					</h3>
					<p class="text-sm text-muted-foreground">
						Fast, reliable web scraping and search API powered by modern technologies.
					</p>
				</div>

				<div>
					<h4 class="mb-4 font-semibold">Features</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li class="flex items-center gap-2">
							<Zap class="h-3 w-3" />
							High-speed scraping
						</li>
						<li class="flex items-center gap-2">
							<Globe class="h-3 w-3" />
							Web search integration
						</li>
						<li class="flex items-center gap-2">
							<Bot class="h-3 w-3" />
							Intelligent crawling
						</li>
					</ul>
				</div>

				<div>
					<h4 class="mb-4 font-semibold">Resources</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li>
							<a href="/docs" class="flex items-center gap-2 hover:text-foreground">
								<BookOpen class="h-3 w-3" />
								API Documentation
							</a>
						</li>
						<li>
							<a
								href="https://github.com"
								class="flex items-center gap-2 hover:text-foreground"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Github class="h-3 w-3" />
								GitHub
							</a>
						</li>
					</ul>
				</div>
			</div>

			<Separator class="my-8" />

			<div class="text-center text-sm text-muted-foreground">
				<p class="flex items-center justify-center gap-1">
					Built with <Heart class="h-4 w-4 text-red-500" /> using SvelteKit, Playwright, and modern web
					technologies
				</p>
				<p class="mt-2">© {new Date().getFullYear()} HiveCrawl. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
