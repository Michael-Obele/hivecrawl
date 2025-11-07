/**
 * Cheerio-based static HTML scraper
 */

import * as cheerio from 'cheerio';
import axios from 'axios';
import UserAgent from 'user-agents';
import { ScrapingError, TimeoutError, ContentTooLargeError } from '../utils/errors';
import { makeAbsolute } from '../utils/url';

const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_TIMEOUT = 30000; // 30 seconds

export interface CheerioScraperOptions {
	timeout?: number;
	waitFor?: string;
	fullPage?: boolean;
}

export interface ScrapeResult {
	url: string;
	title: string;
	content: string;
	html: string;
	metadata: {
		fetchTime: number;
		method: string;
		statusCode: number;
		contentType: string;
		timestamp: string;
	};
	links: Array<{ text: string; href: string; absolute: string }>;
	images: Array<{ src: string; alt: string; absolute: string }>;
}

/**
 * Scrape a URL using Cheerio (static HTML)
 */
export async function scrapeWithCheerio(
	url: string,
	options: CheerioScraperOptions = {}
): Promise<ScrapeResult> {
	const startTime = Date.now();
	const timeout = options.timeout || DEFAULT_TIMEOUT;
	const userAgent = new UserAgent();

	try {
		// Fetch HTML with timeout
		const response = await axios.get(url, {
			headers: {
				'User-Agent': userAgent.toString(),
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.5',
				'Accept-Encoding': 'gzip, deflate, br',
				DNT: '1',
				Connection: 'keep-alive',
				'Upgrade-Insecure-Requests': '1'
			},
			timeout,
			maxContentLength: MAX_CONTENT_SIZE,
			maxRedirects: 5,
			validateStatus: (status) => status < 400 // Accept 2xx and 3xx
		});

		// Check content size
		const contentLength = response.headers['content-length'];
		if (contentLength && parseInt(contentLength) > MAX_CONTENT_SIZE) {
			throw new ContentTooLargeError(parseInt(contentLength), MAX_CONTENT_SIZE);
		}

		const html = response.data;
		const $ = cheerio.load(html);

		// Remove script and style tags
		$('script, style, noscript').remove();

		// Extract title
		const title = $('title').text().trim() || $('h1').first().text().trim() || 'No title';

		// Extract main content
		let content = '';
		const contentSelectors = [
			'main',
			'article',
			'[role="main"]',
			'.content',
			'#content',
			'.main-content',
			'#main-content',
			'.post-content',
			'.entry-content'
		];

		for (const selector of contentSelectors) {
			const element = $(selector).first();
			if (element.length) {
				content = element.text().trim();
				break;
			}
		}

		// Fallback to body if no main content found
		if (!content) {
			content = $('body').text().trim();
		}

		// Clean up content (remove excessive whitespace)
		content = content.replace(/\s+/g, ' ').trim();

		// Extract links
		const links = $('a')
			.map((i, el) => {
				const $el = $(el);
				const href = $el.attr('href');
				if (!href) return null;

				return {
					text: $el.text().trim(),
					href,
					absolute: makeAbsolute(href, url)
				};
			})
			.get()
			.filter(Boolean);

		// Extract images
		const images = $('img')
			.map((i, el) => {
				const $el = $(el);
				const src = $el.attr('src');
				if (!src) return null;

				return {
					src,
					alt: $el.attr('alt') || '',
					absolute: makeAbsolute(src, url)
				};
			})
			.get()
			.filter(Boolean);

		const fetchTime = Date.now() - startTime;

		return {
			url,
			title,
			content,
			html: $.html(),
			metadata: {
				fetchTime,
				method: 'cheerio',
				statusCode: response.status,
				contentType: response.headers['content-type'] || 'text/html',
				timestamp: new Date().toISOString()
			},
			links,
			images
		};
	} catch (error: any) {
		if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
			throw new TimeoutError(url, timeout);
		}

		if (error instanceof ContentTooLargeError) {
			throw error;
		}

		throw new ScrapingError(url, error.message || 'Unknown error');
	}
}
