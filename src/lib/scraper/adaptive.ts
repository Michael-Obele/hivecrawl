/**
 * Adaptive scraper that intelligently chooses between Cheerio and Playwright
 */

import { scrapeWithCheerio, type CheerioScraperOptions } from './cheerio';
import { scrapeWithPlaywright, type PlaywrightScraperOptions } from './playwright';
import { validateContent } from './validator';
import { getCachedMethod, cacheMethod } from '../cache/domain-cache';
import { extractDomain } from '../utils/url';
import type { ScrapeResult } from './cheerio';

export interface AdaptiveScraperOptions {
	timeout?: number;
	waitFor?: string | number;
	screenshot?: boolean;
	fullPage?: boolean;
	forceMethod?: 'cheerio' | 'playwright';
}

export type AdaptiveScrapeResult = ScrapeResult & { screenshot?: string };

/**
 * Intelligently scrape a URL using the best method
 */
export async function scrapeWithAdaptive(
	url: string,
	options: AdaptiveScraperOptions = {}
): Promise<AdaptiveScrapeResult> {
	const domain = extractDomain(url);

	// Check if method is forced
	if (options.forceMethod) {
		if (options.forceMethod === 'playwright') {
			return await scrapeWithPlaywright(url, options);
		} else {
			const cheerioOptions: CheerioScraperOptions = {
				timeout: options.timeout,
				waitFor: typeof options.waitFor === 'string' ? options.waitFor : undefined,
				fullPage: options.fullPage
			};
			return await scrapeWithCheerio(url, cheerioOptions);
		}
	}

	// Check cache for preferred method
	const cachedMethod = getCachedMethod(domain);
	if (cachedMethod === 'playwright') {
		console.log(`Using cached method (Playwright) for ${domain}`);
		const result = await scrapeWithPlaywright(url, options);
		cacheMethod(domain, 'playwright');
		return result;
	}

	// Try Cheerio first (fast)
	console.log(`Trying Cheerio for ${url}...`);
	try {
		const cheerioResult = await scrapeWithCheerio(url, options as CheerioScraperOptions);

		// Validate content
		const validation = validateContent(cheerioResult.html, cheerioResult.content);

		if (validation.isValid) {
			console.log(`✓ Cheerio successful for ${domain} (${validation.textLength} chars)`);
			cacheMethod(domain, 'cheerio');
			return cheerioResult;
		}

		console.log(`✗ Cheerio validation failed: ${validation.reason}`);
	} catch (error: any) {
		console.log(`✗ Cheerio failed: ${error.message}`);
	}

	// Fallback to Playwright
	console.log(`Falling back to Playwright for ${url}...`);
	const playwrightResult = await scrapeWithPlaywright(url, options);
	cacheMethod(domain, 'playwright');
	console.log(`✓ Playwright successful for ${domain}`);

	return playwrightResult;
}
