/**
 * Rate limiting functionality
 */

import Bottleneck from 'bottleneck';
import { RateLimitError } from '../utils/errors';

// Store limiters per IP
const limiters = new Map<string, Bottleneck>();

/**
 * Get or create a rate limiter for a specific key (usually IP address)
 */
export function getRateLimiter(key: string): Bottleneck {
	if (!limiters.has(key)) {
		limiters.set(
			key,
			new Bottleneck({
				minTime: 1000, // 1 request per second
				maxConcurrent: 3, // max 3 concurrent requests
				reservoir: 100, // 100 requests
				reservoirRefreshAmount: 100,
				reservoirRefreshInterval: 60 * 1000 // per minute
			})
		);
	}
	return limiters.get(key)!;
}

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(key: string): Promise<void> {
	const limiter = getRateLimiter(key);

	try {
		await limiter.schedule(() => Promise.resolve());
	} catch (error) {
		throw new RateLimitError('Rate limit exceeded. Please try again later.');
	}
}

/**
 * Wrap a function with rate limiting
 */
export function withRateLimit<T>(key: string, fn: () => Promise<T>): Promise<T> {
	const limiter = getRateLimiter(key);
	return limiter.schedule(() => fn());
}

/**
 * Clear rate limiter for a specific key
 */
export function clearRateLimit(key: string): void {
	const limiter = limiters.get(key);
	if (limiter) {
		limiter.stop();
		limiters.delete(key);
	}
}

/**
 * Get current counts for a limiter
 */
export function getRateLimitInfo(key: string) {
	const limiter = limiters.get(key);
	if (!limiter) {
		return null;
	}

	return {
		queued: limiter.queued(),
		running: limiter.running()
	};
}
