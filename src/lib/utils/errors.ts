/**
 * Custom error classes for HiveCrawl
 */

export class HiveCrawlError extends Error {
	code: string;
	statusCode: number;
	details?: Record<string, any>;

	constructor(code: string, message: string, statusCode = 500, details?: Record<string, any>) {
		super(message);
		this.name = 'HiveCrawlError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
	}
}

export class InvalidUrlError extends HiveCrawlError {
	constructor(url: string, reason?: string) {
		super('INVALID_URL', `Invalid URL: ${url}${reason ? ` - ${reason}` : ''}`, 400, {
			url,
			reason
		});
		this.name = 'InvalidUrlError';
	}
}

export class ScrapingError extends HiveCrawlError {
	constructor(url: string, reason: string) {
		super('SCRAPE_FAILED', `Failed to scrape URL: ${url} - ${reason}`, 500, { url, reason });
		this.name = 'ScrapingError';
	}
}

export class TimeoutError extends HiveCrawlError {
	constructor(url: string, timeout: number) {
		super('TIMEOUT', `Request timeout after ${timeout}ms`, 504, { url, timeout });
		this.name = 'TimeoutError';
	}
}

export class RateLimitError extends HiveCrawlError {
	constructor(message = 'Rate limit exceeded') {
		super('RATE_LIMITED', message, 429);
		this.name = 'RateLimitError';
	}
}

export class ContentTooLargeError extends HiveCrawlError {
	constructor(size: number, maxSize: number) {
		super('CONTENT_TOO_LARGE', `Content size ${size} bytes exceeds maximum ${maxSize} bytes`, 413, {
			size,
			maxSize
		});
		this.name = 'ContentTooLargeError';
	}
}
