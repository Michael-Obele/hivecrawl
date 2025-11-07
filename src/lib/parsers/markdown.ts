/**
 * HTML to Markdown conversion
 */

import TurndownService from 'turndown';

/**
 * Convert HTML to Markdown
 */
export function htmlToMarkdown(html: string): string {
	const turndownService = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '_'
	});

	// Custom rules for better conversion
	turndownService.addRule('strikethrough', {
		filter: ['del', 's'],
		replacement: (content: string) => `~~${content}~~`
	});

	// Remove unwanted elements
	turndownService.remove(['script', 'style', 'noscript', 'iframe', 'object', 'embed']);

	// Convert to markdown
	const markdown = turndownService.turndown(html);

	// Clean up excessive line breaks
	return markdown.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Extract clean text from HTML (no markdown formatting)
 */
export function htmlToText(html: string): string {
	// Simple HTML tag removal
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
