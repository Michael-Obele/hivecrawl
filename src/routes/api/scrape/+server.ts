/**
 * Scrape API endpoint
 * POST /api/scrape
 * Body: { url, format?, options? }
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
