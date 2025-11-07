# HiveCrawl Implementation Plan (Historical)

## 📚 Documentation Navigation

- **[🏠 Main Documentation](../README.md)** - Complete API reference and setup guide
- **[⚡ Quick Start Guide](../QUICKSTART.md)** - 5-minute setup and basic usage
- **[🔧 Implementation Details](../IMPLEMENTATION.md)** - Technical implementation summary
- **[🚀 Deployment Guide](../DEPLOYMENT.md)** - Deploy to Vercel or other platforms

---

**Version:** 1.0  
**Date:** January 7, 2025  
**Status:** ✅ **COMPLETED** - Implementation finished November 2025
**Historical Note:** This document served as the original planning and specification for HiveCrawl. The implementation has been completed and may include features/changes not reflected in this original plan.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture Design](#architecture-design)
4. [Technology Stack](#technology-stack)
5. [API Specification](#api-specification)
6. [Intelligent Scraping Strategy](#intelligent-scraping-strategy)
7. [NPM Package Details & Sample Code](#npm-package-details--sample-code)
8. [Project Structure](#project-structure)
9. [Implementation Phases](#implementation-phases)
10. [Deployment Strategy](#deployment-strategy)
11. [Edge Cases & Error Handling](#edge-cases--error-handling)
12. [Rate Limiting & Performance](#rate-limiting--performance)
13. [Security Considerations](#security-considerations)
14. [Future Enhancements](#future-enhancements)
15. [Integration with Current MCP Project](#integration-with-current-mcp-project)
16. [AI Implementation Prompt](#ai-implementation-prompt)

---

## Executive Summary

**HiveCrawl** is a comprehensive web scraping and search service built with SvelteKit. It provides intelligent web scraping capabilities that automatically detect whether a website requires JavaScript rendering, offers web search functionality via DuckDuckGo, and supports both single-page scraping and multi-page crawling.

**Key Features:**

- 🔍 Web search via DuckDuckGo API
- 🕷️ Intelligent scraping (static + JavaScript-heavy sites)
- 🌐 Multi-page crawling with depth control
- 📄 Multiple output formats (Markdown, HTML, JSON)
- ⚡ Adaptive performance (Cheerio → Playwright fallback)
- 🚀 RESTful API for easy integration
- 🔐 Built-in rate limiting and security

**Primary Use Case:** Power the shadcn-svelte-mcp project while also serving as a standalone scraping service for other applications.

---

## Project Overview

### Name: HiveCrawl

**Inspiration:** Combines the organized efficiency of a beehive with web crawling capabilities.

**Domain Suggestions:**

### Primary Recommendation: Using Your Existing Domain (svelte-apps.me)

Since you own `svelte-apps.me`, here are the top subdomain recommendations for HiveCrawl:

#### 1. **`api.svelte-apps.me`** ⭐ **(Strongest Recommendation)**

- **Why it works:** Standard industry practice for API services
- **Pros:** Professional, versatile, immediately clear it's an API
- **SSL:** Works perfectly with wildcard certificates
- **Future-proof:** Can expand to multiple APIs under this subdomain

#### 2. **`scrape.svelte-apps.me`**

- **Why it works:** Directly describes your core scraping functionality
- **Pros:** Highly descriptive, memorable, clearly indicates the service type
- **Branding:** Straightforward and functional

#### 3. **`hive.svelte-apps.me`**

- **Why it works:** Leverages your "HiveCrawl" branding with bee/hive imagery
- **Pros:** Brand-consistent, unique, memorable
- **Consideration:** Less descriptive of functionality than others

#### 4. **`crawl.svelte-apps.me`**

- **Why it works:** Emphasizes the crawling/search capabilities
- **Pros:** Descriptive of core functionality, professional
- **Similar to:** Industry tools like Crawlee

### Alternative Options (If Not Using svelte-apps.me)

- `hivecrawl.com`
- `api.hivecrawl.com`
- `hivecrawl.dev`

### Goals

1. **Primary:** Create API routes for scraping shadcn-svelte.com documentation
2. **Secondary:** Build a general-purpose web scraping service
3. **Tertiary:** Enable web search + scrape workflows (search → browse → scrape)

### Design Philosophy

- **Adaptive:** Start fast (Cheerio), upgrade when needed (Playwright)
- **Efficient:** Cache decisions, minimize resource usage
- **Reliable:** Comprehensive error handling and fallbacks
- **Scalable:** Designed for serverless deployment

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client/MCP                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SvelteKit API Routes                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   /search    │  │   /scrape    │  │   /crawl     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DuckDuckGo  │  │   Scraper    │  │   Crawlee    │
│   Search     │  │   Service    │  │   Service    │
└──────────────┘  └──────┬───────┘  └──────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │   Cheerio    │  │  Playwright  │
        │  (Static)    │  │  (JS-Heavy)  │
        └──────────────┘  └──────────────┘
```

### Component Breakdown

1. **Search Layer** - DuckDuckGo API integration
2. **Scraper Service** - Intelligent HTML fetching with fallback strategy
3. **Crawler Service** - Multi-page crawling with Crawlee
4. **Parser Layer** - Content extraction and transformation
5. **Cache Layer** - Domain-based scraping method cache
6. **Rate Limiter** - Request throttling and queue management

---

## Technology Stack

### Core Framework

- **SvelteKit** - Modern full-stack framework with excellent API route support
- **TypeScript** - Type safety and better developer experience

### Scraping Libraries

| Package               | Version | Purpose              | Pros                             | Cons                              |
| --------------------- | ------- | -------------------- | -------------------------------- | --------------------------------- |
| `cheerio`             | ^1.0.0  | Static HTML parsing  | Fast, lightweight, low memory    | Cannot handle JS-rendered content |
| `playwright`          | ^1.40.0 | Browser automation   | Handles JS, full browser control | Heavy, slower, more resources     |
| `@crawlee/playwright` | ^3.7.0  | Intelligent crawling | Auto-detects JS needs, adaptive  | Requires Playwright               |
| `duck-duck-scrape`    | ^2.2.0  | DuckDuckGo search    | Free, no API key needed          | Rate limited                      |

### Utilities

| Package       | Version | Purpose                      |
| ------------- | ------- | ---------------------------- |
| `turndown`    | ^7.1.0  | HTML to Markdown conversion  |
| `bottleneck`  | ^2.19.5 | Rate limiting                |
| `user-agents` | ^1.1.0  | Random user agent generation |
| `node-cache`  | ^5.1.2  | In-memory caching            |

### Deployment

- **@sveltejs/adapter-vercel** - Vercel deployment (recommended)
- **@sveltejs/adapter-node** - Node.js deployment (alternative)

### Why Not Netlify for Playwright?

Netlify doesn't support running full browsers in serverless functions or edge functions. Options:

1. Use Vercel (better Playwright support)
2. Use external browser service (Browserless.io)
3. Start with Cheerio-only, add Playwright later

**Recommendation:** Deploy to **Vercel** for best Playwright support.

---

## API Specification

### Base URL Structure

```
https://api.hivecrawl.com/api/{endpoint}
```

### Authentication (Future)

```
Authorization: Bearer {api_key}
```

---

### 1. Search Endpoint

**GET /api/search**

Search the web using DuckDuckGo.

#### Request

```typescript
GET /api/search?q={query}&limit={number}&region={code}
```

| Parameter | Type   | Required | Default | Description                |
| --------- | ------ | -------- | ------- | -------------------------- |
| `q`       | string | Yes      | -       | Search query               |
| `limit`   | number | No       | 10      | Number of results (1-50)   |
| `region`  | string | No       | wt-wt   | Region code (us-en, uk-en) |

#### Response

```json
{
	"success": true,
	"data": {
		"query": "web scraping",
		"results": [
			{
				"title": "Web Scraping 101",
				"url": "https://example.com/scraping",
				"snippet": "Learn the basics of web scraping...",
				"position": 1
			}
		],
		"metadata": {
			"count": 10,
			"fetchTime": 234,
			"region": "us-en"
		}
	},
	"error": null
}
```

#### Example Usage

```bash
curl "https://api.hivecrawl.com/api/search?q=sveltekit&limit=5"
```

---

### 2. Scrape Endpoint

**POST /api/scrape**

Scrape content from a single URL with intelligent detection.

#### Request

```typescript
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com",
  "format": "markdown" | "html" | "json",
  "options": {
    "waitFor": "selector" | number,
    "timeout": 30000,
    "screenshot": false,
    "fullPage": true
  }
}
```

| Field                | Type          | Required | Default    | Description             |
| -------------------- | ------------- | -------- | ---------- | ----------------------- |
| `url`                | string        | Yes      | -          | URL to scrape           |
| `format`             | string        | No       | "markdown" | Output format           |
| `options.waitFor`    | string/number | No       | null       | Wait for selector or ms |
| `options.timeout`    | number        | No       | 30000      | Request timeout (ms)    |
| `options.screenshot` | boolean       | No       | false      | Capture screenshot      |
| `options.fullPage`   | boolean       | No       | true       | Include full content    |

#### Response

```json
{
	"success": true,
	"data": {
		"url": "https://example.com",
		"title": "Example Page",
		"content": "Page content...",
		"markdown": "# Example Page\n\nPage content...",
		"html": "<html>...</html>",
		"metadata": {
			"fetchTime": 1234,
			"method": "cheerio",
			"statusCode": 200,
			"contentType": "text/html",
			"timestamp": "2025-01-07T10:00:00Z"
		},
		"links": [
			{
				"text": "About",
				"href": "/about",
				"absolute": "https://example.com/about"
			}
		],
		"images": [
			{
				"src": "/logo.png",
				"alt": "Logo",
				"absolute": "https://example.com/logo.png"
			}
		],
		"screenshot": "base64..." // if requested
	},
	"error": null
}
```

#### Example Usage

```bash
curl -X POST "https://api.hivecrawl.com/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://shadcn-svelte.com/docs",
    "format": "markdown",
    "options": {
      "waitFor": ".documentation-content"
    }
  }'
```

---

### 3. Crawl Endpoint

**POST /api/crawl**

Crawl multiple pages starting from a URL.

#### Request

```typescript
POST /api/crawl
Content-Type: application/json

{
  "url": "https://example.com",
  "maxPages": 50,
  "maxDepth": 3,
  "sameOrigin": true,
  "patterns": {
    "include": ["*/docs/*"],
    "exclude": ["*/api/*", "*/*.pdf"]
  },
  "async": false
}
```

| Field              | Type     | Required | Default | Description             |
| ------------------ | -------- | -------- | ------- | ----------------------- |
| `url`              | string   | Yes      | -       | Starting URL            |
| `maxPages`         | number   | No       | 50      | Maximum pages to crawl  |
| `maxDepth`         | number   | No       | 3       | Maximum link depth      |
| `sameOrigin`       | boolean  | No       | true    | Stay on same domain     |
| `patterns.include` | string[] | No       | []      | URL patterns to include |
| `patterns.exclude` | string[] | No       | []      | URL patterns to exclude |
| `async`            | boolean  | No       | false   | Return job ID for async |

#### Response (Sync)

```json
{
	"success": true,
	"data": {
		"pages": [
			{
				"url": "https://example.com",
				"title": "Home",
				"content": "...",
				"depth": 0
			}
		],
		"metadata": {
			"totalPages": 25,
			"totalTime": 12340,
			"startedAt": "2025-01-07T10:00:00Z",
			"completedAt": "2025-01-07T10:00:12Z"
		}
	},
	"error": null
}
```

#### Response (Async)

```json
{
	"success": true,
	"data": {
		"jobId": "crawl_abc123",
		"status": "pending",
		"statusUrl": "/api/crawl/crawl_abc123"
	},
	"error": null
}
```

#### Example Usage

```bash
curl -X POST "https://api.hivecrawl.com/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://shadcn-svelte.com/docs",
    "maxPages": 100,
    "maxDepth": 2,
    "patterns": {
      "include": ["*/docs/*"]
    }
  }'
```

---

### 4. Crawl Status Endpoint (Async)

**GET /api/crawl/:jobId**

Check status of async crawl job.

#### Response

```json
{
  "success": true,
  "data": {
    "jobId": "crawl_abc123",
    "status": "in_progress" | "completed" | "failed",
    "progress": {
      "pagesScraped": 45,
      "pagesTotal": 100,
      "percentage": 45
    },
    "results": [], // populated when completed
    "error": null
  }
}
```

---

### Error Response Format

All endpoints return errors in consistent format:

```json
{
	"success": false,
	"data": null,
	"error": {
		"code": "SCRAPE_FAILED",
		"message": "Failed to scrape URL",
		"details": {
			"url": "https://example.com",
			"reason": "Timeout after 30000ms"
		}
	}
}
```

#### Error Codes

| Code                 | HTTP Status | Description                |
| -------------------- | ----------- | -------------------------- |
| `INVALID_URL`        | 400         | Invalid or malformed URL   |
| `MISSING_PARAMETER`  | 400         | Required parameter missing |
| `RATE_LIMITED`       | 429         | Too many requests          |
| `SCRAPE_FAILED`      | 500         | Failed to fetch content    |
| `TIMEOUT`            | 504         | Request timeout            |
| `UNSUPPORTED_FORMAT` | 400         | Invalid format requested   |

---

## Intelligent Scraping Strategy

### Decision Flow

```
┌─────────────────┐
│  Receive URL    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Cache     │◄─── Domain-based cache (24h TTL)
│ for Domain      │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Cached? │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
   Yes                   No
    │                     │
    ▼                     ▼
┌─────────────┐    ┌─────────────┐
│ Use Cached  │    │ Try Cheerio │
│ Method      │    │  (< 1 sec)  │
└─────────────┘    └──────┬──────┘
                          │
                          ▼
                   ┌─────────────────┐
                   │ Validate Content│
                   │ - Length > 100  │
                   │ - Has text      │
                   │ - Has structure │
                   └────────┬────────┘
                            │
                      ┌─────┴─────┐
                      │ Valid?    │
                      └─────┬─────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
                 Yes                 No
                  │                   │
                  ▼                   ▼
           ┌──────────────┐    ┌──────────────┐
           │ Return       │    │ Retry with   │
           │ Cheerio      │    │ Playwright   │
           │ Result       │    └──────┬───────┘
           └──────────────┘           │
                  │                   ▼
                  │            ┌──────────────┐
                  │            │ Cache Method │
                  │            │ for Domain   │
                  │            └──────┬───────┘
                  │                   │
                  └──────────┬────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Return Final │
                      │   Result     │
                      └──────────────┘
```

### Validation Criteria

Content is considered valid if it meets these criteria:

```typescript
function validateContent(html: string, text: string): boolean {
  return (
    (text.length > 100 && // Has sufficient text
      html.includes("</") && // Has closing tags
      !text.includes("JavaScript is disabled") && // Not a JS-disabled page
      !html.includes("data-react-root")) || // Not an unrendered React app
    (html.includes("data-react-root") && text.length > 500) // OR rendered React
  );
}
```

### Heuristics for JS Detection

```typescript
const jsIndicators = {
  framework: [
    "data-react-root",
    "data-reactroot",
    "ng-app",
    "data-ng-app",
    "v-app",
    "__NEXT_DATA__",
  ],
  emptyState: ['<div id="root"></div>', '<div id="app"></div>', "noscript"],
  metaHints: ["spa", "single-page-application", "client-side-rendering"],
};

function needsJavaScript(html: string): boolean {
  const hasFramework = jsIndicators.framework.some((ind) => html.includes(ind));
  const hasEmptyState = jsIndicators.emptyState.some((ind) =>
    html.includes(ind)
  );
  const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] || "";
  const isEmpty = bodyContent.trim().length < 100;

  return hasFramework || (hasEmptyState && isEmpty);
}
```

### Cache Strategy

```typescript
interface CacheEntry {
  domain: string;
  method: "cheerio" | "playwright";
  timestamp: number;
  successCount: number;
}

// Cache TTL: 24 hours
// Key: domain (e.g., "example.com")
// Value: preferred scraping method
```

---

## NPM Package Details & Sample Code

### 1. Cheerio - Static HTML Parsing

**Installation:**

```bash
npm install cheerio
```

**Sample Code:**

```typescript
import * as cheerio from "cheerio";
import axios from "axios";

async function scrapeWithCheerio(url: string) {
  try {
    // Fetch HTML
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    // Load into Cheerio
    const $ = cheerio.load(response.data);

    // Extract data
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content");

    // Extract all links
    const links = $("a")
      .map((i, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr("href"),
      }))
      .get();

    // Extract main content (common patterns)
    const content = $("main, article, .content, #content")
      .first()
      .text()
      .trim();

    return {
      url,
      title,
      description,
      content,
      links,
      method: "cheerio",
    };
  } catch (error) {
    throw new Error(`Cheerio scraping failed: ${error.message}`);
  }
}

// Usage
const result = await scrapeWithCheerio("https://example.com");
console.log(result);
```

**Pros:**

- Lightning fast (< 1 second for most pages)
- Low memory usage (~10-20MB)
- Simple jQuery-like syntax
- Perfect for static HTML

**Cons:**

- Cannot execute JavaScript
- Cannot handle dynamic content
- Cannot interact with pages (clicks, scrolls)

---

### 2. Playwright - Browser Automation

**Installation:**

```bash
npm install playwright
# Install browsers
npx playwright install chromium
```

**Sample Code:**

```typescript
import { chromium } from "playwright";

async function scrapeWithPlaywright(url: string, options = {}) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    // Navigate with network idle wait
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Optional: Wait for specific selector
    if (options.waitFor) {
      await page.waitForSelector(options.waitFor, { timeout: 10000 });
    }

    // Extract data
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        content: document.body.innerText,
        links: Array.from(document.querySelectorAll("a")).map((a) => ({
          text: a.textContent?.trim(),
          href: a.href,
        })),
        html: document.documentElement.outerHTML,
      };
    });

    // Optional: Screenshot
    if (options.screenshot) {
      data.screenshot = await page.screenshot({
        fullPage: true,
        type: "png",
      });
    }

    return {
      ...data,
      url,
      method: "playwright",
    };
  } finally {
    await browser.close();
  }
}

// Usage
const result = await scrapeWithPlaywright("https://example.com", {
  waitFor: ".main-content",
  screenshot: false,
});
```

**Pros:**

- Handles JavaScript-rendered content
- Can interact with pages (click, scroll, type)
- Supports screenshots and PDFs
- Multiple browser support (Chromium, Firefox, WebKit)

**Cons:**

- Slower (3-10 seconds per page)
- Higher memory usage (~100-200MB per browser instance)
- Requires browser binaries
- More complex error handling

---

### 3. Crawlee - Intelligent Crawling Framework

**Installation:**

```bash
npm install @crawlee/playwright
```

**Sample Code:**

```typescript
import { PlaywrightCrawler } from "@crawlee/playwright";

async function crawlSite(startUrl: string, options = {}) {
  const results: any[] = [];

  const crawler = new PlaywrightCrawler({
    // Adaptive rendering detection
    renderingTypeDetectionRatio: 0.1, // Test 10% of pages for JS requirement

    maxRequestsPerCrawl: options.maxPages || 50,
    maxRequestsPerMinute: 20,

    async requestHandler({ request, page, enqueueLinks }) {
      console.log(`Scraping: ${request.url}`);

      // Extract data
      const data = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        content: document.body.innerText,
        html: document.documentElement.outerHTML,
      }));

      results.push(data);

      // Find and queue more links
      await enqueueLinks({
        globs: options.patterns?.include || ["**"],
        exclude: options.patterns?.exclude || [],
        strategy: "same-domain",
      });
    },

    failedRequestHandler({ request, error }) {
      console.error(`Request ${request.url} failed: ${error.message}`);
    },
  });

  await crawler.run([startUrl]);

  return results;
}

// Usage
const pages = await crawlSite("https://example.com/docs", {
  maxPages: 100,
  patterns: {
    include: ["**/docs/**"],
    exclude: ["**/api/**"],
  },
});

console.log(`Crawled ${pages.length} pages`);
```

**Pros:**

- Automatically detects if JS rendering is needed
- Smart request scheduling and retries
- Built-in queue management
- Respects robots.txt

**Cons:**

- Learning curve for advanced features
- Requires Playwright (heavier)
- Overkill for single-page scraping

---

### 4. DuckDuckGo Search - duck-duck-scrape

**Installation:**

```bash
npm install duck-duck-scrape
```

**Sample Code:**

```typescript
import { search, SafeSearchType } from "duck-duck-scrape";

async function searchWeb(query: string, limit = 10) {
  try {
    const results = await search(query, {
      safeSearch: SafeSearchType.MODERATE,
      locale: "en-us",
      offset: 0,
    });

    // Transform results
    return results.results.slice(0, limit).map((result, index) => ({
      title: result.title,
      url: result.url,
      snippet: result.description,
      position: index + 1,
    }));
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

// Usage
const results = await searchWeb("web scraping tutorial", 5);
console.log(results);
```

**Alternative: Direct DuckDuckGo API**

```typescript
import axios from "axios";

async function searchDuckDuckGo(query: string) {
  const response = await axios.get("https://api.duckduckgo.com/", {
    params: {
      q: query,
      format: "json",
      no_html: 1,
      skip_disambig: 1,
    },
  });

  return {
    answer: response.data.AbstractText,
    url: response.data.AbstractURL,
    relatedTopics: response.data.RelatedTopics.map((topic: any) => ({
      title: topic.Text,
      url: topic.FirstURL,
    })),
  };
}
```

**Pros:**

- No API key required
- Free to use
- Returns quality results

**Cons:**

- Rate limited (be respectful)
- Less features than Google Search API
- May require scraping for full results

---

### 5. Turndown - HTML to Markdown

**Installation:**

```bash
npm install turndown
```

**Sample Code:**

```typescript
import TurndownService from "turndown";

function convertToMarkdown(html: string) {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
  });

  // Custom rules for better conversion
  turndownService.addRule("strikethrough", {
    filter: ["del", "s"],
    replacement: (content) => `~~${content}~~`,
  });

  // Remove unwanted elements
  turndownService.remove(["script", "style", "noscript"]);

  const markdown = turndownService.turndown(html);

  return markdown
    .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
    .trim();
}

// Usage
const html = "<h1>Hello</h1><p>This is <strong>important</strong>.</p>";
const markdown = convertToMarkdown(html);
console.log(markdown);
// Output:
// # Hello
//
// This is **important**.
```

---

### 6. Bottleneck - Rate Limiting

**Installation:**

```bash
npm install bottleneck
```

**Sample Code:**

```typescript
import Bottleneck from "bottleneck";

// Create limiter: max 10 requests per second
const limiter = new Bottleneck({
  minTime: 100, // 100ms between requests
  maxConcurrent: 5, // max 5 concurrent requests
  reservoir: 100, // 100 requests
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000, // per minute
});

// Wrap scraping function
const rateLimitedScrape = limiter.wrap(async (url: string) => {
  return await scrapeWithCheerio(url);
});

// Usage
const urls = ["url1", "url2", "url3" /* ... */];
const results = await Promise.all(urls.map((url) => rateLimitedScrape(url)));
```

---

### 7. node-cache - In-Memory Caching

**Installation:**

```bash
npm install node-cache
```

**Sample Code:**

```typescript
import NodeCache from "node-cache";

// Cache with 24-hour TTL
const cache = new NodeCache({
  stdTTL: 86400, // 24 hours
  checkperiod: 3600, // Check for expired keys every hour
  useClones: false,
});

interface CacheEntry {
  method: "cheerio" | "playwright";
  successCount: number;
  timestamp: number;
}

function getCachedMethod(domain: string): "cheerio" | "playwright" | null {
  const entry = cache.get<CacheEntry>(domain);
  return entry?.method || null;
}

function cacheMethod(domain: string, method: "cheerio" | "playwright") {
  const existing = cache.get<CacheEntry>(domain);

  cache.set<CacheEntry>(domain, {
    method,
    successCount: (existing?.successCount || 0) + 1,
    timestamp: Date.now(),
  });
}

// Usage
const domain = new URL(url).hostname;
const cachedMethod = getCachedMethod(domain);

if (cachedMethod) {
  // Use cached method
} else {
  // Try and cache result
  const method = await detectBestMethod(url);
  cacheMethod(domain, method);
}
```

---

## Project Structure

```
hivecrawl/
├── src/
│   ├── routes/
│   │   └── api/
│   │       ├── search/
│   │       │   └── +server.ts          # Search endpoint
│   │       ├── scrape/
│   │       │   └── +server.ts          # Scrape endpoint
│   │       └── crawl/
│   │           ├── +server.ts          # Crawl endpoint
│   │           └── [jobId]/
│   │               └── +server.ts      # Crawl status
│   │
│   ├── lib/
│   │   ├── scraper/
│   │   │   ├── cheerio.ts             # Cheerio scraper
│   │   │   ├── playwright.ts          # Playwright scraper
│   │   │   ├── adaptive.ts            # Adaptive scraper logic
│   │   │   └── validator.ts           # Content validation
│   │   │
│   │   ├── crawler/
│   │   │   ├── crawlee.ts             # Crawlee configuration
│   │   │   └── queue.ts               # Job queue management
│   │   │
│   │   ├── search/
│   │   │   └── duckduckgo.ts          # DuckDuckGo integration
│   │   │
│   │   ├── parsers/
│   │   │   ├── markdown.ts            # HTML to Markdown
│   │   │   ├── json.ts                # JSON extraction
│   │   │   └── metadata.ts            # Metadata extraction
│   │   │
│   │   ├── cache/
│   │   │   └── domain-cache.ts        # Domain method cache
│   │   │
│   │   ├── limiter/
│   │   │   └── rate-limit.ts          # Rate limiting
│   │   │
│   │   └── utils/
│   │       ├── url.ts                 # URL utilities
│   │       ├── errors.ts              # Error classes
│   │       └── response.ts            # Response formatting
│   │
│   └── app.html                        # (optional) minimal HTML
│
├── static/                             # Static assets (if any)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                        # Environment variables template
├── svelte.config.js                    # SvelteKit configuration
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation

- [x] Set up SvelteKit project
- [x] Configure TypeScript
- [x] Install core dependencies
- [x] Create basic API route structure
- [x] Implement response formatting utilities

### Phase 2: Basic Scraping

- [x] Implement Cheerio scraper
- [x] Add content validation
- [x] Create error handling
- [x] Test on static websites
- [x] Implement HTML to Markdown conversion

### Phase 3: Intelligent Scraping

- [x] Implement Playwright scraper
- [x] Create adaptive scraping logic
- [x] Add JS detection heuristics
- [x] Implement domain caching
- [x] Test on JS-heavy sites

### Phase 4: Search Integration

- [x] Integrate DuckDuckGo API
- [x] Implement search endpoint
- [x] Add search result parsing
- [x] Test search functionality

### Phase 5: Crawling

- [x] Set up Crawlee
- [x] Implement multi-page crawling
- [x] Add URL pattern matching
- [x] Implement depth limiting
- [ ] Add async job queue (optional)

### Phase 6: Polish & Deploy

- [x] Add rate limiting
- [x] Implement caching strategy
- [x] Write comprehensive tests
- [x] Create documentation
- [ ] Deploy to Vercel
- [x] Monitor and optimize

---

## Deployment Strategy

### Vercel Deployment (Recommended)

**Why Vercel:**

- Native SvelteKit support
- Better Playwright/Puppeteer support
- Generous free tier
- Automatic HTTPS
- Edge network

**Configuration:**

1. **Install Vercel adapter:**

```bash
npm install -D @sveltejs/adapter-vercel
```

2. **Update svelte.config.js:**

```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter({
			runtime: 'nodejs18.x',
			regions: ['iad1'], // US East
			maxDuration: 60 // Max execution time
		})
	}
};
```

3. **Create vercel.json:**

```json
{
	"buildCommand": "npm run build",
	"devCommand": "npm run dev",
	"installCommand": "npm install",
	"framework": "sveltekit",
	"regions": ["iad1"],
	"functions": {
		"api/**/*.ts": {
			"memory": 1024,
			"maxDuration": 60
		}
	}
}
```

4. **Environment Variables:**

```bash
# .env.example
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
BROWSERLESS_TOKEN=optional_for_external_browser
```

5. **Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Alternative: Node.js Deployment

For self-hosting (VPS, DigitalOcean, etc.):

```bash
npm install -D @sveltejs/adapter-node
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true,
			envPrefix: 'APP_'
		})
	}
};
```

Run with PM2:

```bash
npm run build
pm2 start build/index.js --name hivecrawl
```

---

## Edge Cases & Error Handling

### 1. Timeout Handling

```typescript
async function fetchWithTimeout(url: string, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "HiveCrawl/1.0",
      },
    });
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 2. Invalid URLs

```typescript
function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTP/HTTPS URLs are supported" };
    }

    if (parsed.hostname === "localhost" || parsed.hostname.startsWith("127.")) {
      return { valid: false, error: "Localhost URLs are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}
```

### 3. Rate Limiting Detection

```typescript
function isRateLimited(response: Response): boolean {
  return (
    response.status === 429 ||
    response.headers.get("retry-after") !== null ||
    response.headers.get("x-ratelimit-remaining") === "0"
  );
}

async function handleRateLimit(response: Response) {
  const retryAfter = response.headers.get("retry-after");
  const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

  await new Promise((resolve) => setTimeout(resolve, waitTime));
  // Retry logic here
}
```

### 4. Content Type Validation

```typescript
function isScrapeableContentType(contentType: string): boolean {
  const scrapeableTypes = [
    "text/html",
    "application/xhtml+xml",
    "application/xml",
    "text/plain",
  ];

  return scrapeableTypes.some((type) =>
    contentType.toLowerCase().includes(type)
  );
}
```

### 5. Memory Management

```typescript
// Limit concurrent operations
const CONCURRENT_LIMIT = 5;
const semaphore = new Semaphore(CONCURRENT_LIMIT);

async function scrapeWithMemoryLimit(urls: string[]) {
  const results = [];

  for (const url of urls) {
    await semaphore.acquire();

    scrape(url)
      .then((result) => results.push(result))
      .finally(() => semaphore.release());
  }

  return results;
}
```

### 6. Malformed HTML

```typescript
function sanitizeHtml(html: string): string {
  // Remove problematic elements
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "") // Remove inline event handlers
    .trim();
}
```

---

## Rate Limiting & Performance

### Request Rate Limiting

```typescript
// lib/limiter/rate-limit.ts
import Bottleneck from "bottleneck";
import { error } from "@sveltejs/kit";

const limiters = new Map<string, Bottleneck>();

export function getRateLimiter(key: string) {
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Bottleneck({
        minTime: 1000, // 1 request per second per user
        maxConcurrent: 3,
        reservoir: 100, // 100 requests
        reservoirRefreshAmount: 100,
        reservoirRefreshInterval: 60 * 1000, // per minute
      })
    );
  }
  return limiters.get(key)!;
}

export async function checkRateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limiter = getRateLimiter(ip);

  try {
    await limiter.schedule(() => Promise.resolve());
  } catch {
    throw error(429, "Rate limit exceeded. Please try again later.");
  }
}
```

### Caching Strategy

```typescript
// Cache levels:
// 1. Domain method cache (24h) - Which scraping method to use
// 2. Content cache (1h) - Actual scraped content
// 3. Search cache (15min) - Search results

interface CacheConfig {
  domainMethodTTL: number; // 24 hours
  contentTTL: number; // 1 hour
  searchTTL: number; // 15 minutes
}

const config: CacheConfig = {
  domainMethodTTL: 86400,
  contentTTL: 3600,
  searchTTL: 900,
};
```

### Performance Monitoring

```typescript
function measurePerformance<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();

  return fn().then((result) => {
    const duration = performance.now() - start;
    console.log(`${label}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  });
}

// Usage
const { result, duration } = await measurePerformance(
  () => scrapeWithCheerio(url),
  "Cheerio Scrape"
);
```

---

## Security Considerations

### 1. URL Validation & Sanitization

```typescript
const BLOCKED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254", // AWS metadata
  "metadata.google.internal", // GCP metadata
];

function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url);
    return !BLOCKED_DOMAINS.some((domain) => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}
```

### 2. Content Size Limits

```typescript
const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB

async function fetchWithSizeLimit(url: string) {
  const response = await fetch(url);
  const contentLength = response.headers.get("content-length");

  if (contentLength && parseInt(contentLength) > MAX_CONTENT_SIZE) {
    throw new Error("Content too large");
  }

  return response;
}
```

### 3. User-Agent Rotation

```typescript
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
```

### 4. CORS Configuration

```typescript
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  if (event.url.pathname.startsWith("/api/")) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGINS || "*"
    );
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
};
```

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Proxy Rotation**
   - Integrate proxy services (BrightData, ScraperAPI)
   - Automatic proxy selection
   - Failure recovery

2. **Authentication Support**
   - API key management
   - OAuth integration
   - Session handling

3. **Advanced Scraping**
   - PDF extraction
   - Image OCR
   - Video metadata

4. **Webhooks**
   - Callback URLs for async jobs
   - Real-time progress updates

5. **Analytics Dashboard**
   - Usage statistics
   - Success/failure rates
   - Performance metrics

6. **Premium Features**
   - Priority queue
   - Higher rate limits
   - Longer timeouts
   - Screenshot API

### Proxy Rotation Implementation (Future)

```typescript
// lib/proxy/rotator.ts
import { HttpsProxyAgent } from "https-proxy-agent";

interface ProxyConfig {
  host: string;
  port: number;
  auth?: { username: string; password: string };
}

class ProxyRotator {
  private proxies: ProxyConfig[];
  private currentIndex = 0;

  constructor(proxies: ProxyConfig[]) {
    this.proxies = proxies;
  }

  getNext(): ProxyConfig {
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  createAgent(proxy: ProxyConfig) {
    const auth = proxy.auth
      ? `${proxy.auth.username}:${proxy.auth.password}@`
      : "";
    const url = `http://${auth}${proxy.host}:${proxy.port}`;
    return new HttpsProxyAgent(url);
  }
}

// Usage
const rotator = new ProxyRotator([
  { host: "proxy1.com", port: 8080 },
  { host: "proxy2.com", port: 8080 },
]);

const proxy = rotator.getNext();
const agent = rotator.createAgent(proxy);
```

---

## Integration with Current MCP Project

### How HiveCrawl Serves the MCP

Your current `shadcn-svelte-mcp` project can use HiveCrawl in two ways:

#### 1. As Internal Dependency

Deploy HiveCrawl separately and call it from your MCP tools:

```typescript
// src/mastra/tools/shadcn-svelte-get.ts (modified)
import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export const shadcnSvelteGet = createTool({
  id: "shadcn-svelte-get",
  description: "Get documentation for shadcn-svelte components",
  inputSchema: z.object({
    name: z.string(),
    type: z.enum(["component", "doc"]),
  }),
  execute: async ({ context }) => {
    const { name, type } = context;

    // Call HiveCrawl API instead of direct scraping
    const response = await fetch("https://api.hivecrawl.com/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: `https://shadcn-svelte.com/${type}s/${name}`,
        format: "markdown",
        options: {
          waitFor: ".documentation-content",
        },
      }),
    });

    const data = await response.json();
    return data.data.markdown;
  },
});
```

#### 2. As Shared Routes

Copy the HiveCrawl routes into your MCP project:

```
shadcn-svelte-mcp/
├── src/
│   ├── routes/
│   │   └── api/
│   │       ├── search/           # From HiveCrawl
│   │       ├── scrape/           # From HiveCrawl
│   │       └── crawl/            # From HiveCrawl
│   └── lib/
│       └── hivecrawl/            # HiveCrawl library code
│           ├── scraper/
│           ├── crawler/
│           └── search/
```

Then use locally:

```typescript
export const shadcnSvelteGet = createTool({
  id: "shadcn-svelte-get",
  execute: async ({ context }) => {
    // Import local HiveCrawl functions
    const { scrapeWithAdaptive } = await import(
      "$lib/hivecrawl/scraper/adaptive"
    );

    const result = await scrapeWithAdaptive(url, { format: "markdown" });
    return result.markdown;
  },
});
```

### Benefits for MCP Project

1. **Reliability:** Intelligent JS detection ensures docs are always scraped correctly
2. **Performance:** Cache means faster repeated lookups
3. **Flexibility:** Can scrape any documentation site, not just shadcn-svelte
4. **Maintainability:** Separate service makes debugging easier

---

## AI Implementation Prompt

Below is a comprehensive prompt to give to an AI coding assistant when ready to implement:

---

### 🤖 AI Implementation Prompt

**Context:**
You are implementing HiveCrawl, a web scraping and search service built with SvelteKit. The service provides intelligent web scraping that automatically detects whether JavaScript rendering is needed, web search via DuckDuckGo, and multi-page crawling capabilities.

**Project Name:** HiveCrawl  
**Framework:** SvelteKit + TypeScript  
**Deployment:** Vercel

**Your Task:**
Implement the complete HiveCrawl service following the detailed specification in `hivecrawl-implementation-plan.md`.

**Implementation Steps:**

1. **Initialize Project**

   ```bash
   npm create svelte@latest hivecrawl
   # Select: Skeleton project, TypeScript, ESLint, Prettier
   cd hivecrawl
   npm install
   ```

2. **Install Dependencies**

   ```bash
   npm install cheerio playwright @crawlee/playwright duck-duck-scrape turndown bottleneck node-cache user-agents axios
   npm install -D @sveltejs/adapter-vercel
   npx playwright install chromium
   ```

3. **Create Project Structure**
   Follow the structure defined in the "Project Structure" section of the plan.

4. **Implement Core Components** in this order:
   - Response utilities (`lib/utils/response.ts`)
   - Error classes (`lib/utils/errors.ts`)
   - Content validator (`lib/scraper/validator.ts`)
   - Cheerio scraper (`lib/scraper/cheerio.ts`)
   - Playwright scraper (`lib/scraper/playwright.ts`)
   - Adaptive scraper (`lib/scraper/adaptive.ts`)
   - Domain cache (`lib/cache/domain-cache.ts`)
   - DuckDuckGo integration (`lib/search/duckduckgo.ts`)
   - Markdown parser (`lib/parsers/markdown.ts`)
   - Rate limiter (`lib/limiter/rate-limit.ts`)

5. **Implement API Routes**
   - `/api/search/+server.ts`
   - `/api/scrape/+server.ts`
   - `/api/crawl/+server.ts`
   - `/api/crawl/[jobId]/+server.ts`

6. **Configure Adapter**
   Update `svelte.config.js` with Vercel adapter settings from the deployment section.

7. **Add Environment Variables**
   Create `.env.example` with all required variables.

8. **Test Implementation**
   - Test static site scraping (e.g., example.com)
   - Test JS-heavy site (e.g., react-based SPA)
   - Test search endpoint
   - Test crawling with depth limits
   - Verify caching works
   - Test rate limiting

**Key Implementation Notes:**

- **Adaptive Scraping:** Always try Cheerio first, validate content, then fallback to Playwright if needed
- **Cache:** Cache the scraping method (cheerio vs playwright) per domain for 24 hours
- **Error Handling:** Use try-catch blocks extensively, return structured errors
- **Response Format:** All endpoints return `{ success, data, error }` format
- **Rate Limiting:** Implement per-IP rate limiting using Bottleneck
- **Security:** Validate URLs, block localhost/private IPs, limit content size
- **Performance:** Log timing for each operation, optimize where needed

**Testing Checklist:**

- [ ] Can scrape static HTML sites (example.com)
- [ ] Can scrape JS-heavy sites (React/Vue/Angular apps)
- [ ] Caching reduces subsequent scrapes of same domain
- [ ] Rate limiting prevents abuse
- [ ] Invalid URLs are rejected
- [ ] Timeouts are handled gracefully
- [ ] Large content is limited appropriately
- [ ] Markdown conversion works correctly
- [ ] Search returns quality results
- [ ] Crawling respects depth and page limits

**Documentation to Create:**

1. `README.md` - Setup, usage, API documentation
2. `API.md` - Detailed API reference with examples
3. `.env.example` - All environment variables
4. `DEPLOYMENT.md` - Deployment instructions

**Expected Output:**

A fully functional SvelteKit application with working API endpoints that can:

- Search the web via DuckDuckGo
- Scrape individual web pages intelligently
- Crawl multiple pages from a starting URL
- Return data in multiple formats (Markdown, HTML, JSON)
- Handle both static and JavaScript-rendered websites
- Respect rate limits and implement caching

**Verification:**

When complete, test with:

```bash
# Start dev server
npm run dev

# Test search
curl "http://localhost:5173/api/search?q=web+scraping&limit=5"

# Test scrape
curl -X POST http://localhost:5173/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","format":"markdown"}'

# Test crawl
curl -X POST http://localhost:5173/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":5}'
```

All endpoints should return structured JSON responses with proper error handling.

**Reference:**
Refer to the complete specification in `hivecrawl-implementation-plan.md` for:

- Detailed API specifications
- Sample code for each npm package
- Edge case handling
- Security considerations
- Deployment configuration

Begin implementation with Phase 1 (Foundation) and proceed sequentially through each phase. Ask for clarification if any part of the specification is unclear.

---

## Conclusion

This comprehensive plan provides everything needed to implement HiveCrawl:

✅ **Complete Architecture** - All components designed and documented  
✅ **Technology Choices** - Each package justified with pros/cons  
✅ **Sample Code** - Working examples for every major component  
✅ **API Specification** - Every endpoint fully documented  
✅ **Edge Cases** - Common problems identified with solutions  
✅ **Deployment Strategy** - Ready-to-use Vercel configuration  
✅ **Security** - Built-in protection against common attacks  
✅ **Performance** - Caching and rate limiting strategies  
✅ **Integration** - Clear path to use with MCP project

**Next Steps:**

1. Review this plan thoroughly
2. Ask any clarifying questions
3. Set up development environment
4. Begin Phase 1 implementation
5. Test incrementally as you build
6. Deploy to Vercel when Phase 1-5 complete

**Questions to Consider:**

- Do you want to start with MVP (Phases 1-4) or full implementation?
- Should we deploy HiveCrawl separately or integrate into MCP project?
- Any specific shadcn-svelte.com scraping requirements we missed?
- Do you want async crawling with job queue initially or add later?

The plan is ready for implementation. Good luck building HiveCrawl! 🚀🐝
