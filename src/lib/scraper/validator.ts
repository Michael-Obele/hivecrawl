/**
 * Content validation utilities
 */

export interface ValidationResult {
	isValid: boolean;
	reason?: string;
	textLength: number;
	hasStructure: boolean;
}

/**
 * Validate if scraped content is meaningful
 */
export function validateContent(html: string, text: string): ValidationResult {
	const textLength = text.trim().length;
	const hasStructure = html.includes('</') && html.split('</').length > 5;

	// Check for insufficient content
	if (textLength < 100) {
		return {
			isValid: false,
			reason: 'Content too short (less than 100 characters)',
			textLength,
			hasStructure
		};
	}

	// Check for basic HTML structure
	if (!hasStructure) {
		return {
			isValid: false,
			reason: 'No valid HTML structure detected',
			textLength,
			hasStructure: false
		};
	}

	// Check for JavaScript-disabled messages
	const jsDisabledIndicators = [
		'javascript is disabled',
		'enable javascript',
		'javascript is required',
		'please enable javascript',
		'you need to enable javascript'
	];

	const lowerText = text.toLowerCase();
	for (const indicator of jsDisabledIndicators) {
		if (lowerText.includes(indicator)) {
			return {
				isValid: false,
				reason: 'JavaScript-disabled warning detected',
				textLength,
				hasStructure
			};
		}
	}

	// Check for unrendered React/Vue/Angular apps
	const emptyAppIndicators = [
		'<div id="root"></div>',
		'<div id="app"></div>',
		'<div id="__next"></div>'
	];

	for (const indicator of emptyAppIndicators) {
		if (html.includes(indicator) && textLength < 500) {
			return {
				isValid: false,
				reason: 'Empty app container detected (likely unrendered SPA)',
				textLength,
				hasStructure
			};
		}
	}

	return {
		isValid: true,
		textLength,
		hasStructure
	};
}

/**
 * Detect if a page likely needs JavaScript rendering
 */
export function needsJavaScript(html: string): boolean {
	const jsIndicators = {
		framework: [
			'data-react-root',
			'data-reactroot',
			'ng-app',
			'data-ng-app',
			'v-app',
			'__NEXT_DATA__',
			'__nuxt',
			'data-server-rendered'
		],
		emptyState: [
			'<div id="root"></div>',
			'<div id="app"></div>',
			'<div id="__next"></div>',
			'noscript'
		],
		metaHints: ['spa', 'single-page-application', 'client-side-rendering']
	};

	// Check for framework indicators
	const hasFramework = jsIndicators.framework.some((ind) => html.includes(ind));

	// Check for empty state
	const hasEmptyState = jsIndicators.emptyState.some((ind) => html.includes(ind));

	// Check body content
	const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
	const bodyContent = bodyMatch ? bodyMatch[1] : '';
	const isEmpty = bodyContent.trim().length < 100;

	return hasFramework || (hasEmptyState && isEmpty);
}
