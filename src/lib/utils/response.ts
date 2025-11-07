/**
 * Standardized API response utilities
 */

export interface ApiResponse<T = any> {
	success: boolean;
	data: T | null;
	error: ApiError | null;
}

export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, any>;
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
	return {
		success: true,
		data,
		error: null
	};
}

/**
 * Create an error response
 */
export function errorResponse(
	code: string,
	message: string,
	details?: Record<string, any>
): ApiResponse {
	return {
		success: false,
		data: null,
		error: {
			code,
			message,
			details
		}
	};
}

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse<T>(data: ApiResponse<T>, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
