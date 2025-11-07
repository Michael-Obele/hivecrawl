/**
 * URL validation and utilities
 */

import { InvalidUrlError } from './errors';

// Blocked domains for security
const BLOCKED_DOMAINS = [
	'localhost',
	'127.0.0.1',
	'0.0.0.0',
	'169.254.169.254', // AWS metadata
	'metadata.google.internal', // GCP metadata
	'169.254.', // Link-local addresses
	'10.', // Private network
	'172.16.', // Private network
	'192.168.' // Private network
];

/**
 * Validate if a URL is safe to scrape
 */
export function validateUrl(urlString: string): void {
	let url: URL;

	try {
		url = new URL(urlString);
	} catch {
		throw new InvalidUrlError(urlString, 'Invalid URL format');
	}

	// Check protocol
	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new InvalidUrlError(urlString, 'Only HTTP/HTTPS URLs are supported');
	}

	// Check for blocked domains
	const hostname = url.hostname.toLowerCase();
	for (const blocked of BLOCKED_DOMAINS) {
		if (hostname === blocked || hostname.startsWith(blocked)) {
			throw new InvalidUrlError(urlString, 'Access to this domain is not allowed');
		}
	}
}

/**
 * Normalize a URL
 */
export function normalizeUrl(urlString: string): string {
	const url = new URL(urlString);
	// Remove trailing slash from pathname
	if (url.pathname.endsWith('/') && url.pathname.length > 1) {
		url.pathname = url.pathname.slice(0, -1);
	}
	return url.toString();
}

/**
 * Extract domain from URL
 */
export function extractDomain(urlString: string): string {
	try {
		const url = new URL(urlString);
		return url.hostname;
	} catch {
		return '';
	}
}

/**
 * Check if URL matches a pattern
 */
export function matchesPattern(url: string, patterns: string[]): boolean {
	if (patterns.length === 0) return true;

	return patterns.some((pattern) => {
		// Convert glob pattern to regex
		const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.');
		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(url);
	});
}

/**
 * Make URL absolute
 */
export function makeAbsolute(url: string, baseUrl: string): string {
	try {
		return new URL(url, baseUrl).toString();
	} catch {
		return url;
	}
}
