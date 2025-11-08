/**
 * Crawl API endpoint
 * POST /api/crawl
 * Body: { url, maxPages?, maxDepth?, sameOrigin?, patterns? }
 *
 * @swagger
 * /api/crawl:
 *   post:
 *     summary: Crawl a website and extract content
 *     description: Crawls a website starting from the given URL, following links and extracting content from pages
 *     tags:
 *       - Crawling
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: The starting URL to crawl
 *               maxPages:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 50
 *                 description: Maximum number of pages to crawl
 *               maxDepth:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 3
 *                 description: Maximum depth to follow links
 *               sameOrigin:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to stay within the same domain
 *               patterns:
 *                 type: object
 *                 properties:
 *                   include:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: URL patterns to include (regex)
 *                   exclude:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: URL patterns to exclude (regex)
 *     responses:
 *       200:
 *         description: Successful crawl
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         format: uri
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       markdown:
 *                         type: string
 *                       depth:
 *                         type: integer
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: integer
 *                     totalTime:
 *                       type: integer
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 */

import type { RequestHandler } from './$types';
import { PlaywrightCrawler } from '@crawlee/playwright';
import { validateUrl, matchesPattern, extractDomain } from '$lib/utils/url';
import { htmlToMarkdown } from '$lib/parsers/markdown';
import { successResponse, errorResponse, jsonResponse } from '$lib/utils/response';
import { checkRateLimit } from '$lib/limiter/rate-limit';
import { HiveCrawlError } from '$lib/utils/errors';

interface CrawlOptions {
	url: string;
	maxPages?: number;
	maxDepth?: number;
	sameOrigin?: boolean;
	patterns?: {
		include?: string[];
		exclude?: string[];
	};
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Rate limiting
		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		await checkRateLimit(ip);

		// Parse request body
		const body: CrawlOptions = await request.json();
		const { url, maxPages = 50, maxDepth = 3, sameOrigin = true, patterns = {} } = body;

		// Validate URL
		if (!url) {
			return jsonResponse(errorResponse('MISSING_PARAMETER', 'URL is required'), 400);
		}

		validateUrl(url);

		// Validate limits
		if (maxPages < 1 || maxPages > 100) {
			return jsonResponse(
				errorResponse('INVALID_PARAMETER', 'maxPages must be between 1 and 100'),
				400
			);
		}

		if (maxDepth < 1 || maxDepth > 5) {
			return jsonResponse(
				errorResponse('INVALID_PARAMETER', 'maxDepth must be between 1 and 5'),
				400
			);
		}

		const startTime = Date.now();
		const results: any[] = [];
		const visited = new Set<string>();
		const startDomain = extractDomain(url);

		// Create crawler
		const crawler = new PlaywrightCrawler({
			maxRequestsPerCrawl: maxPages,
			maxRequestsPerMinute: 20,

			async requestHandler({ request: req, page, enqueueLinks }) {
				const currentUrl = req.url;

				// Skip if already visited
				if (visited.has(currentUrl)) {
					return;
				}

				visited.add(currentUrl);
				console.log(`Crawling [${visited.size}/${maxPages}]: ${currentUrl}`);

				// Extract data from page
				const data = await page.evaluate(() => {
					// Remove script and style tags
					document.querySelectorAll('script, style, noscript').forEach((el) => el.remove());

					const title =
						document.title || document.querySelector('h1')?.textContent?.trim() || 'No title';

					// Extract main content
					let content = '';
					const contentSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];

					for (const selector of contentSelectors) {
						const element = document.querySelector(selector);
						if (element) {
							content = element.textContent?.trim() || '';
							break;
						}
					}

					if (!content) {
						content = document.body.textContent?.trim() || '';
					}

					content = content.replace(/\s+/g, ' ').trim();

					return {
						title,
						content,
						html: document.documentElement.outerHTML
					};
				});

				// Add to results
				results.push({
					url: currentUrl,
					title: data.title,
					content: data.content,
					markdown: htmlToMarkdown(data.html),
					depth: req.userData?.depth || 0
				});

				// Enqueue more links if within limits
				if ((req.userData?.depth || 0) < maxDepth) {
					await enqueueLinks({
						strategy: sameOrigin ? 'same-domain' : 'all',
						userData: {
							depth: (req.userData?.depth || 0) + 1
						},
						transformRequestFunction: (request) => {
							// Apply pattern filters
							if (patterns.include && patterns.include.length > 0) {
								if (!matchesPattern(request.url, patterns.include)) {
									return false;
								}
							}

							if (patterns.exclude && patterns.exclude.length > 0) {
								if (matchesPattern(request.url, patterns.exclude)) {
									return false;
								}
							}

							return request;
						}
					});
				}
			},

			failedRequestHandler({ request: req, error }) {
				const err = error as Error;
				console.error(`Request ${req.url} failed:`, err.message);
			}
		});

		// Run crawler
		await crawler.run([{ url, userData: { depth: 0 } }]);

		const totalTime = Date.now() - startTime;

		const responseData = {
			pages: results,
			metadata: {
				totalPages: results.length,
				totalTime,
				startedAt: new Date(startTime).toISOString(),
				completedAt: new Date().toISOString()
			}
		};

		return jsonResponse(successResponse(responseData));
	} catch (error: any) {
		console.error('Crawl error:', error);

		if (error instanceof HiveCrawlError) {
			return jsonResponse(
				errorResponse(error.code, error.message, error.details),
				error.statusCode
			);
		}

		return jsonResponse(errorResponse('CRAWL_FAILED', error.message || 'Crawling failed'), 500);
	}
};
