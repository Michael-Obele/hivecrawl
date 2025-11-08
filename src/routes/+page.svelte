<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Search, Bot, Rocket, Heart, BookOpen, Github } from '@lucide/svelte';

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
	class="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<header
		class="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-12 text-center text-white shadow-xl"
	>
		<h1 class="mb-4 text-6xl font-bold drop-shadow-lg">🐝 HiveCrawl</h1>
		<p class="mx-auto max-w-2xl text-xl opacity-90">
			Powerful web scraping and search APIs for developers. Extract data, crawl websites, and search
			the web with ease.
		</p>
		<div class="mt-6 flex justify-center gap-4">
			<a
				href="/docs"
				class="rounded-lg bg-white/20 px-6 py-3 font-semibold backdrop-blur-sm transition hover:bg-white/30"
			>
				<BookOpen class="mr-2 inline h-5 w-5" />
				API Docs
			</a>
			<a
				href="https://github.com/Michael-Obele/hivecrawl"
				target="_blank"
				class="rounded-lg bg-white/20 px-6 py-3 font-semibold backdrop-blur-sm transition hover:bg-white/30"
			>
				<Github class="mr-2 inline h-5 w-5" />
				GitHub
			</a>
		</div>
	</header>

	<main class="container mx-auto px-4 py-12">
		<div class="mx-auto max-w-4xl">
			<!-- Tab Navigation -->
			<div class="mb-8 flex justify-center">
				<div class="rounded-lg bg-muted p-1 shadow-lg dark:bg-gray-800">
					<Button
						onclick={() => (activeTab = 'scrape')}
						variant={activeTab === 'scrape' ? 'default' : 'ghost'}
						class="rounded-md px-6 py-3 font-medium transition"
					>
						<Search class="mr-2 h-4 w-4" />
						Scrape Page
					</Button>
					<Button
						onclick={() => (activeTab = 'crawl')}
						variant={activeTab === 'crawl' ? 'default' : 'ghost'}
						class="rounded-md px-6 py-3 font-medium transition"
					>
						<Bot class="mr-2 h-4 w-4" />
						Crawl Site
					</Button>
					<Button
						onclick={() => (activeTab = 'search')}
						variant={activeTab === 'search' ? 'default' : 'ghost'}
						class="rounded-md px-6 py-3 font-medium transition"
					>
						<Search class="mr-2 h-4 w-4" />
						Search Web
					</Button>
				</div>
			</div>

			<!-- Scrape Tab -->
			{#if activeTab === 'scrape'}
				<Card.Root class="mx-auto w-full max-w-4xl">
					<Card.Header>
						<Card.Title class="text-3xl font-bold">Scrape a Webpage</Card.Title>
						<Card.Description>
							Extract content from any webpage. Supports multiple formats including markdown, HTML,
							and JSON.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<form onsubmit={handleScrape} class="space-y-6">
							<div class="space-y-2">
								<label
									for="scrape-url"
									class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									URL to scrape
								</label>
								<Input
									id="scrape-url"
									type="url"
									bind:value={scrapeUrl}
									placeholder="https://example.com"
									required
								/>
							</div>

							<div class="space-y-2">
								<label
									for="scrape-format"
									class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Output format
								</label>
								<Select.Root type="single" bind:value={scrapeFormat}>
									<Select.Trigger class="w-full">
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
								class="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
									<Rocket class="mr-2 h-4 w-4" />
									Scrape Page
								{/if}
							</Button>
						</form>

						{#if scrapeResult}
							<div class="mt-8">
								<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Result</h3>
								<div class="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
									{#if scrapeResult.error}
										<p class="text-red-600 dark:text-red-400">Error: {scrapeResult.error}</p>
									{:else}
										<div class="space-y-4">
											<div>
												<strong>Title:</strong>
												{scrapeResult.data?.title || 'No title'}
											</div>
											<div>
												<strong>URL:</strong>
												{scrapeResult.data?.url}
											</div>
											{#if scrapeFormat === 'markdown'}
												<div>
													<strong>Content (Markdown):</strong>
													<pre
														class="mt-2 rounded border bg-white p-3 text-sm whitespace-pre-wrap dark:bg-gray-800">{scrapeResult
															.data?.markdown}</pre>
												</div>
											{:else if scrapeFormat === 'html'}
												<div>
													<strong>Content (HTML):</strong>
													<pre
														class="mt-2 rounded border bg-white p-3 text-sm whitespace-pre-wrap dark:bg-gray-800">{scrapeResult
															.data?.html}</pre>
												</div>
											{:else}
												<div>
													<strong>Content:</strong>
													<pre
														class="mt-2 rounded border bg-white p-3 text-sm whitespace-pre-wrap dark:bg-gray-800">{JSON.stringify(
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
			{/if}

			<!-- Crawl Tab -->
			{#if activeTab === 'crawl'}
				<Card.Root class="mx-auto w-full max-w-4xl">
					<Card.Header>
						<Card.Title class="text-3xl font-bold">Crawl a Website</Card.Title>
						<Card.Description>
							Crawl an entire website starting from a URL. Follows links and extracts content from
							multiple pages.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<form onsubmit={handleCrawl} class="space-y-6">
							<div>
								<label
									for="crawl-url"
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Starting URL
								</label>
								<input
									id="crawl-url"
									type="url"
									bind:value={crawlUrl}
									placeholder="https://example.com"
									required
									class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label
										for="max-pages"
										class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Max Pages (1-50)
									</label>
									<input
										id="max-pages"
										type="number"
										min="1"
										max="50"
										bind:value={crawlMaxPages}
										class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									/>
								</div>

								<div>
									<label
										for="max-depth"
										class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Max Depth (1-3)
									</label>
									<input
										id="max-depth"
										type="number"
										min="1"
										max="3"
										bind:value={crawlMaxDepth}
										class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={crawlLoading}
								class="w-full rounded-lg bg-linear-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition duration-200 hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
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
									<Bot class="mr-2 h-4 w-4" />
									Start Crawling
								{/if}
							</button>
						</form>

						{#if crawlResult}
							<div class="mt-8">
								<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Result</h3>
								<div class="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
									{#if crawlResult.error}
										<p class="text-red-600 dark:text-red-400">Error: {crawlResult.error}</p>
									{:else}
										<div class="space-y-4">
											<div>
												<strong>Pages crawled:</strong>
												{crawlResult.data?.metadata?.totalPages || 0}
											</div>
											<div>
												<strong>Total time:</strong>
												{crawlResult.data?.metadata?.totalTime
													? `${(crawlResult.data.metadata.totalTime / 1000).toFixed(2)}s`
													: 'N/A'}
											</div>
											<div>
												<strong>Pages:</strong>
												<div class="mt-2 max-h-64 space-y-2 overflow-y-auto">
													{#each crawlResult.data?.pages || [] as page}
														<div class="rounded border bg-white p-3 dark:bg-gray-800">
															<div class="font-medium">{page.title || 'No title'}</div>
															<div class="truncate text-sm text-gray-600 dark:text-gray-400">
																{page.url}
															</div>
															<div class="mt-1 text-xs text-gray-500">Depth: {page.depth}</div>
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
			{/if}

			<!-- Search Tab -->
			{#if activeTab === 'search'}
				<Card.Root class="mx-auto w-full max-w-4xl">
					<Card.Header>
						<Card.Title class="text-3xl font-bold">Search the Web</Card.Title>
						<Card.Description>
							Search the web using DuckDuckGo. Get relevant results instantly.
						</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<form onsubmit={handleSearch} class="space-y-6">
							<div>
								<label
									for="search-query"
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Search query
								</label>
								<input
									id="search-query"
									type="text"
									bind:value={searchQuery}
									placeholder="What are you looking for?"
									required
									class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<div>
								<label
									for="search-limit"
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Max results (1-50)
								</label>
								<input
									id="search-limit"
									type="number"
									min="1"
									max="50"
									bind:value={searchLimit}
									class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<button
								type="submit"
								disabled={searchLoading}
								class="w-full rounded-lg bg-linear-to-r from-green-600 to-teal-600 px-6 py-3 font-semibold text-white transition duration-200 hover:from-green-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
							>
								{#if searchLoading}
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
										Searching...
									</span>
								{:else}
									<Search class="mr-2 h-4 w-4" />
									Search Web
								{/if}
							</button>
						</form>

						{#if searchResult}
							<div class="mt-8">
								<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
									Search Results
								</h3>
								<div class="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
									{#if searchResult.error}
										<p class="text-red-600 dark:text-red-400">Error: {searchResult.error}</p>
									{:else}
										<div class="space-y-4">
											{#each searchResult.data || [] as result}
												<div class="rounded-lg border bg-white p-4 dark:bg-gray-800">
													<h4
														class="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
													>
														<a href={result.url} target="_blank" rel="noopener noreferrer">
															{result.title}
														</a>
													</h4>
													<p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
														{result.description}
													</p>
													<div class="mt-2 text-xs text-gray-500">{result.displayUrl}</div>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</main>

	<footer class="mt-16 bg-gray-900 py-12 text-white">
		<div class="container mx-auto px-4 text-center">
			<p class="text-gray-400">
				Built with <Heart class="mx-1 inline h-4 w-4 text-red-500" /> using SvelteKit, Playwright, and
				modern web technologies
			</p>
		</div>
	</footer>
</div>
