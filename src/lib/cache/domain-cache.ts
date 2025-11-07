/**
 * Domain-based caching for scraping method selection
 */

import NodeCache from 'node-cache';

interface CacheEntry {
	domain: string;
	method: 'cheerio' | 'playwright';
	timestamp: number;
	successCount: number;
}

// Cache with 24-hour TTL
const cache = new NodeCache({
	stdTTL: 86400, // 24 hours
	checkperiod: 3600, // Check for expired keys every hour
	useClones: false
});

/**
 * Get cached scraping method for a domain
 */
export function getCachedMethod(domain: string): 'cheerio' | 'playwright' | null {
	const entry = cache.get<CacheEntry>(domain);
	return entry?.method || null;
}

/**
 * Cache the successful scraping method for a domain
 */
export function cacheMethod(domain: string, method: 'cheerio' | 'playwright'): void {
	const existing = cache.get<CacheEntry>(domain);

	cache.set<CacheEntry>(domain, {
		domain,
		method,
		timestamp: Date.now(),
		successCount: (existing?.successCount || 0) + 1
	});

	console.log(`✓ Cached method for ${domain}: ${method}`);
}

/**
 * Clear cache for a specific domain
 */
export function clearDomainCache(domain: string): void {
	cache.del(domain);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
	cache.flushAll();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
	return cache.getStats();
}
