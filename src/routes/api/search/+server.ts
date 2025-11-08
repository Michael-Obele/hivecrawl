/**
 * Search API endpoint
 * GET /api/search?q={query}&limit={number}&region={code}
 *
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search the web using DuckDuckGo
 *     description: Performs a web search using DuckDuckGo and returns relevant results
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results to return
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           default: wt-wt
 *         description: Search region code (e.g., us-en, uk-en)
 *     responses:
 *       200:
 *         description: Successful search
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   url:
 *                     type: string
 *                     format: uri
 *                   description:
 *                     type: string
 *                   displayUrl:
 *                     type: string
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
import { searchDuckDuckGo } from '$lib/search/duckduckgo';
import { successResponse, errorResponse, jsonResponse } from '$lib/utils/response';
import { checkRateLimit } from '$lib/limiter/rate-limit';
import { HiveCrawlError } from '$lib/utils/errors';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		// Rate limiting
		const ip =
			request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
		await checkRateLimit(ip);

		// Get query parameters
		const query = url.searchParams.get('q');
		const limitParam = url.searchParams.get('limit');
		const region = url.searchParams.get('region') || 'wt-wt';

		// Validate query
		if (!query || query.trim().length === 0) {
			return jsonResponse(
				errorResponse('MISSING_PARAMETER', 'Query parameter "q" is required'),
				400
			);
		}

		// Parse limit
		const limit = limitParam ? parseInt(limitParam, 10) : 10;
		if (isNaN(limit) || limit < 1 || limit > 50) {
			return jsonResponse(
				errorResponse('INVALID_PARAMETER', 'Limit must be between 1 and 50'),
				400
			);
		}

		// Perform search
		const results = await searchDuckDuckGo(query, { limit, region });
		console.log('Search results:', results);

		return jsonResponse(successResponse(results));
	} catch (error: any) {
		console.error('Search error:', error);

		if (error instanceof HiveCrawlError) {
			return jsonResponse(
				errorResponse(error.code, error.message, error.details),
				error.statusCode
			);
		}

		return jsonResponse(errorResponse('SEARCH_FAILED', error.message || 'Search failed'), 500);
	}
};
