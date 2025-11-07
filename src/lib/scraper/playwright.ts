/**
 * Playwright-based dynamic content scraper
 */

import { chromium, type Browser, type Page } from 'playwright';
import UserAgent from 'user-agents';
import { ScrapingError, TimeoutError } from '../utils/errors';
import type { ScrapeResult } from './cheerio';
import { makeAbsolute } from '../utils/url';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export interface PlaywrightScraperOptions {
	timeout?: number;
	waitFor?: string | number;
	screenshot?: boolean;
	fullPage?: boolean;
}

let browserInstance: Browser | null = null;

/**
 * Get or create a shared browser instance
 */
async function getBrowser(): Promise<Browser> {
	if (!browserInstance || !browserInstance.isConnected()) {
		browserInstance = await chromium.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
		});
	}
	return browserInstance;
}

/**
 * Scrape a URL using Playwright (dynamic content)
 */
export async function scrapeWithPlaywright(
	url: string,
	options: PlaywrightScraperOptions = {}
): Promise<ScrapeResult & { screenshot?: string }> {
	const startTime = Date.now();
	const timeout = options.timeout || DEFAULT_TIMEOUT;
	const userAgent = new UserAgent();

	let page: Page | null = null;

	try {
		const browser = await getBrowser();
		const context = await browser.newContext({
			userAgent: userAgent.toString(),
			viewport: { width: 1280, height: 720 },
			locale: 'en-US'
		});

		page = await context.newPage();

		// Set default timeout
		page.setDefaultTimeout(timeout);

		// Navigate to URL
		await page.goto(url, {
			waitUntil: 'networkidle',
			timeout
		});

		// Optional: Wait for specific selector or time
		if (options.waitFor) {
			if (typeof options.waitFor === 'string') {
				await page.waitForSelector(options.waitFor, { timeout: 10000 });
			} else {
				await page.waitForTimeout(options.waitFor);
			}
		}

		// Extract data from page
		const data = await page.evaluate(() => {
			// Remove script and style tags
			document.querySelectorAll('script, style, noscript').forEach((el) => el.remove());

			// Extract title
			const title =
				document.title || document.querySelector('h1')?.textContent?.trim() || 'No title';

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
				const element = document.querySelector(selector);
				if (element) {
					content = element.textContent?.trim() || '';
					break;
				}
			}

			// Fallback to body
			if (!content) {
				content = document.body.textContent?.trim() || '';
			}

			// Clean up content
			content = content.replace(/\s+/g, ' ').trim();

			// Extract links
			const links = Array.from(document.querySelectorAll('a'))
				.map((a) => ({
					text: a.textContent?.trim() || '',
					href: a.getAttribute('href') || '',
					absolute: a.href
				}))
				.filter((link) => link.href);

			// Extract images
			const images = Array.from(document.querySelectorAll('img'))
				.map((img) => ({
					src: img.getAttribute('src') || '',
					alt: img.getAttribute('alt') || '',
					absolute: img.src
				}))
				.filter((img) => img.src);

			return {
				title,
				content,
				html: document.documentElement.outerHTML,
				links,
				images
			};
		});

		// Optional: Capture screenshot
		let screenshot: string | undefined;
		if (options.screenshot) {
			const buffer = await page.screenshot({
				fullPage: options.fullPage !== false,
				type: 'png'
			});
			screenshot = buffer.toString('base64');
		}

		await context.close();

		const fetchTime = Date.now() - startTime;

		return {
			url,
			title: data.title,
			content: data.content,
			html: data.html,
			metadata: {
				fetchTime,
				method: 'playwright',
				statusCode: 200,
				contentType: 'text/html',
				timestamp: new Date().toISOString()
			},
			links: data.links,
			images: data.images,
			screenshot
		};
	} catch (error: any) {
		if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
			throw new TimeoutError(url, timeout);
		}

		throw new ScrapingError(url, error.message || 'Unknown error');
	} finally {
		if (page) {
			await page.close();
		}
	}
}

/**
 * Close the browser instance (call on shutdown)
 */
export async function closeBrowser(): Promise<void> {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
}
