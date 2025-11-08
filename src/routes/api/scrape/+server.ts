/**
 * Scrape API endpoint
 * POST /api/scrape
 * Body: { url, format?, options? }
 *
 * @swagger
 * /api/scrape:
 *   post:
 *     summary: Scrape content from a single URL
 *     description: Extracts content from a single webpage with various formatting options
 *     tags:
 *       - Scraping
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
 *                 description: The URL to scrape
 *               format:
 *                 type: string
 *                 enum: [markdown, html, json]
 *                 default: markdown
 *                 description: Output format for the content
 *               options:
 *                 type: object
 *                 properties:
 *                   timeout:
 *                     type: integer
 *                     default: 30000
 *                     description: Request timeout in milliseconds
 *                   waitFor:
 *                     type: string
 *                     description: CSS selector to wait for before scraping
 *                   screenshot:
 *                     type: boolean
 *                     default: false
 *                     description: Whether to include a screenshot
 *                   fullPage:
 *                     type: boolean
 *                     default: true
 *                     description: Whether to capture full page content
 *                   forceMethod:
 *                     type: string
 *                     enum: [playwright, cheerio]
 *                     description: Force a specific scraping method
 *     responses:
 *       200:
 *         description: Successful scrape
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 metadata:
 *                   type: object
 *                 links:
 *                   type: array
 *                   items:
 *                     type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 markdown:
 *                   type: string
 *                 html:
 *                   type: string
 *                 screenshot:
 *                   type: string
 *                   description: Base64 encoded screenshot (if requested)
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
import { scrapeWithAdaptive, type AdaptiveScraperOptions } from '$lib/scraper/adaptive';
import { htmlToMarkdown } from '$lib/parsers/markdown';
import { validateUrl } from '$lib/utils/url';
import { successResponse, errorResponse, jsonResponse } from '$lib/utils/response';
import { checkRateLimit } from '$lib/limiter/rate-limit';
import { HiveCrawlError } from '$lib/utils/errors';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Rate limiting
		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		await checkRateLimit(ip);

		// Parse request body
		const body = await request.json();
		const { url, format = 'markdown', options = {} } = body;

		// Validate URL parameter
		if (!url) {
			return jsonResponse(errorResponse('MISSING_PARAMETER', 'URL is required'), 400);
		}

		// Validate URL
		validateUrl(url);

		// Validate format
		const validFormats = ['markdown', 'html', 'json'];
		if (!validFormats.includes(format)) {
			return jsonResponse(
				errorResponse('UNSUPPORTED_FORMAT', `Format must be one of: ${validFormats.join(', ')}`),
				400
			);
		}

		// Build scraper options
		const scraperOptions: AdaptiveScraperOptions = {
			timeout: options.timeout || 30000,
			waitFor: options.waitFor,
			screenshot: options.screenshot || false,
			fullPage: options.fullPage !== false,
			forceMethod: options.forceMethod
		};

		// Scrape the URL
		const result = await scrapeWithAdaptive(url, scraperOptions);

		// Format response based on requested format
		let responseData: any = {
			url: result.url,
			title: result.title,
			metadata: result.metadata,
			links: result.links,
			images: result.images
		};

		if (format === 'markdown') {
			responseData.markdown = htmlToMarkdown(result.html);
			responseData.content = result.content;
		} else if (format === 'html') {
			responseData.html = result.html;
			responseData.content = result.content;
		} else if (format === 'json') {
			responseData.content = result.content;
			responseData.html = result.html;
			responseData.markdown = htmlToMarkdown(result.html);
		}

		// Include screenshot if requested
		if (result.screenshot) {
			responseData.screenshot = result.screenshot;
		}

		return jsonResponse(successResponse(responseData));
	} catch (error: any) {
		console.error('Scrape error:', error);

		if (error instanceof HiveCrawlError) {
			return jsonResponse(
				errorResponse(error.code, error.message, error.details),
				error.statusCode
			);
		}

		return jsonResponse(errorResponse('SCRAPE_FAILED', error.message || 'Scraping failed'), 500);
	}
};
