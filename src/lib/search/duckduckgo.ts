/**
 * DuckDuckGo search integration using direct API calls
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

export interface SearchOptions {
	limit?: number;
	region?: string;
	safeSearch?: 'strict' | 'moderate' | 'off';
}

export interface SearchResult {
	title: string;
	url: string;
	snippet: string;
	position: number;
}

export interface SearchResponse {
	query: string;
	results: SearchResult[];
	metadata: {
		count: number;
		fetchTime: number;
		region: string;
		method: 'html' | 'instant-answer';
	};
}

/**
 * Get a random user agent for requests
 */
function getRandomUserAgent(): string {
	const userAgent = new UserAgent();
	return userAgent.toString();
}

/**
 * Search using DuckDuckGo HTML endpoint
 */
async function searchWithHtmlEndpoint(
	query: string,
	options: SearchOptions = {}
): Promise<SearchResult[]> {
	const limit = options.limit || 10;
	const region = options.region || 'wt-wt';

	// Build search URL
	const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=${region}`;

	// Try up to 3 times with different user agents and delays
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const userAgent = getRandomUserAgent();
			const delay = attempt * 2000; // 0ms, 2s, 4s delays

			if (delay > 0) {
				console.log(`Waiting ${delay}ms before retry ${attempt + 1}...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			console.log(`[DuckDuckGo HTML] Attempt ${attempt + 1}/3 for query: ${query}`);

			const response = await axios.get(searchUrl, {
				headers: {
					'User-Agent': userAgent,
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
					'Accept-Language': 'en-US,en;q=0.5',
					'Accept-Encoding': 'gzip, deflate',
					Connection: 'keep-alive',
					'Upgrade-Insecure-Requests': '1',
					'Cache-Control': 'no-cache',
					Pragma: 'no-cache'
				},
				timeout: 15000,
				maxRedirects: 5,
				validateStatus: (status) => status < 500 // Accept 4xx responses to see what's happening
			});

			console.log(`[DuckDuckGo HTML] Response status: ${response.status}`);

			if (response.status === 403) {
				console.warn('[DuckDuckGo HTML] Got 403 Forbidden - likely IP blocked or rate limited');
				continue;
			}

			if (response.status === 429) {
				console.warn('[DuckDuckGo HTML] Got 429 Too Many Requests - rate limited');
				const retryAfter = response.headers['retry-after'];
				if (retryAfter) {
					const waitTime = parseInt(retryAfter) * 1000;
					console.log(`Waiting ${waitTime}ms as requested by server...`);
					await new Promise((resolve) => setTimeout(resolve, waitTime));
				}
				continue;
			}

			if (response.status !== 200) {
				console.warn(`[DuckDuckGo HTML] Unexpected status ${response.status}`);
				continue;
			}

			const $ = cheerio.load(response.data);
			const results: SearchResult[] = [];

			// Parse results from HTML
			$('.result').each((index, element) => {
				if (results.length >= limit) return false;

				const $result = $(element);
				const title = $result.find('.result__title a').text().trim();
				let url = $result.find('.result__url').attr('href') || '';

				// Clean up DuckDuckGo redirect URLs
				if (url.startsWith('//duckduckgo.com/l/?uddg=')) {
					try {
						const urlParams = new URL(url, 'https://duckduckgo.com').searchParams;
						const encodedUrl = urlParams.get('uddg');
						if (encodedUrl) {
							url = decodeURIComponent(encodedUrl);
						}
					} catch (e) {
						// Keep original URL if parsing fails
					}
				}

				const snippet = $result.find('.result__snippet').text().trim();

				if (title && url) {
					results.push({
						title,
						url,
						snippet: snippet || '',
						position: results.length + 1
					});
				}
			});

			console.log(`[DuckDuckGo HTML] Found ${results.length} results`);

			if (results.length > 0) {
				return results;
			}

			// If no results found on last attempt, try the lite version
			if (attempt === 2) {
				console.log('[DuckDuckGo HTML] Trying lite version as final attempt...');
				const liteUrl = `https://duckduckgo.com/lite/?q=${encodeURIComponent(query)}&kl=${region}`;
				const liteResponse = await axios.get(liteUrl, {
					headers: {
						'User-Agent': userAgent,
						Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
					},
					timeout: 10000
				});

				const $lite = cheerio.load(liteResponse.data);
				const liteResults: SearchResult[] = [];

				$lite('td a[href]').each((index, element) => {
					if (liteResults.length >= limit) return false;

					const $link = $lite(element);
					const href = $link.attr('href');
					const text = $link.text().trim();

					// Skip if it's not a result link
					if (!href || href.startsWith('/')) return;

					liteResults.push({
						title: text,
						url: href,
						snippet: '',
						position: liteResults.length + 1
					});
				});

				console.log(`[DuckDuckGo Lite] Found ${liteResults.length} results`);
				return liteResults;
			}
		} catch (error: any) {
			console.error(`[DuckDuckGo HTML] Attempt ${attempt + 1} error:`, {
				message: error.message,
				code: error.code,
				status: error.response?.status
			});

			// Wait before retry
			if (attempt < 2) {
				await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
			}
		}
	}

	console.warn('[DuckDuckGo HTML] All attempts failed');
	return [];
}

/**
 * Search using DuckDuckGo Instant Answer API (fallback)
 */
async function searchWithInstantAnswerAPI(
	query: string,
	options: SearchOptions = {}
): Promise<SearchResult[]> {
	const limit = options.limit || 10;

	try {
		const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

		const response = await axios.get(apiUrl, {
			headers: {
				'User-Agent': getRandomUserAgent()
			},
			timeout: 5000
		});

		const data = response.data;
		const results: SearchResult[] = [];

		// Parse instant answer (Abstract)
		if (data.Abstract && data.Abstract.trim()) {
			results.push({
				title: data.Heading || 'Instant Answer',
				url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
				snippet: data.Abstract,
				position: results.length + 1
			});
		}

		// Parse direct results
		if (data.Results && Array.isArray(data.Results)) {
			for (const result of data.Results.slice(0, limit - results.length)) {
				if (result.FirstURL && result.Text) {
					// Clean HTML from text
					const cleanText = result.Text.replace(/<[^>]*>/g, '').trim();
					results.push({
						title: cleanText.split(' - ')[0] || 'Search Result',
						url: result.FirstURL,
						snippet: cleanText,
						position: results.length + 1
					});
				}
			}
		}

		// Parse related topics (with HTML cleaning)
		if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
			for (const topic of data.RelatedTopics.slice(0, limit - results.length)) {
				if (topic.Text && topic.FirstURL) {
					// Clean HTML from text and extract meaningful content
					const cleanText = topic.Text.replace(/<[^>]*>/g, '').trim();
					const title = cleanText.split(' - ')[0] || 'Related Topic';

					results.push({
						title,
						url: topic.FirstURL,
						snippet: cleanText,
						position: results.length + 1
					});
				}
			}
		}

		return results;
	} catch (error: any) {
		console.warn('Instant Answer API failed:', error.message);
		return [];
	}
}

/**
 * Search the web using DuckDuckGo with direct API calls
 */
export async function searchDuckDuckGo(
	query: string,
	options: SearchOptions = {}
): Promise<SearchResponse> {
	const startTime = Date.now();
	const region = options.region || 'wt-wt';

	try {
		// Try HTML endpoint first (more comprehensive results)
		let results = await searchWithHtmlEndpoint(query, options);
		let method: 'html' | 'instant-answer' = 'html';

		// Fallback to Instant Answer API if no results
		if (results.length === 0) {
			results = await searchWithInstantAnswerAPI(query, options);
			method = 'instant-answer';
		}

		const fetchTime = Date.now() - startTime;

		return {
			query,
			results,
			metadata: {
				count: results.length,
				fetchTime,
				region,
				method
			}
		};
	} catch (error: any) {
		throw new Error(`Search failed: ${error.message}`);
	}
}
