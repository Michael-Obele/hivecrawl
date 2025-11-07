/**
 * Search API endpoint
 * GET /api/search?q={query}&limit={number}&region={code}
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
