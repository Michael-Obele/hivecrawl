# HiveCrawl

## 📚 Documentation Navigation

- **[⚡ Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[🔧 Implementation Details](./IMPLEMENTATION.md)** - Technical implementation summary
- **[🚀 Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel or other platforms
- **[📋 Implementation Plan](./docs/hivecrawl-implementation-plan.md)** - Complete technical specification

---

**HiveCrawl** is a comprehensive web scraping and search service built with SvelteKit. It provides intelligent web scraping capabilities that automatically detect whether a website requires JavaScript rendering, offers web search functionality via DuckDuckGo, and supports both single-page scraping and multi-page crawling.

## 🚀 Features

- 🔍 **Web Search** - Search the web using DuckDuckGo API
- 🕷️ **Intelligent Scraping** - Automatically detects if JavaScript rendering is needed
- 🌐 **Multi-Page Crawling** - Crawl entire websites with depth control
- 📄 **Multiple Formats** - Export data as Markdown, HTML, or JSON
- ⚡ **Adaptive Performance** - Fast Cheerio scraping with Playwright fallback
- 🚀 **RESTful API** - Easy integration via HTTP endpoints
- 🔐 **Built-in Security** - Rate limiting, URL validation, and content size limits
- 💾 **Smart Caching** - Cache scraping method decisions per domain

## 📋 Prerequisites

- Node.js 18+ or Bun
- npm, pnpm, or bun package manager

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/hivecrawl.git
   cd hivecrawl
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Install Playwright browsers:**

   ```bash
   npx playwright install chromium
   ```

4. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Quick setup command:**

   ```bash
   cp .env.example .env && echo "✅ Environment file created. Edit .env with your configuration."
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5173/api`

## 🔧 Configuration

See `.env.example` for all available configuration options:

- `ALLOWED_ORIGINS` - CORS allowed origins
- `RATE_LIMIT_MAX` - Maximum requests per window
- `RATE_LIMIT_WINDOW` - Rate limit window in milliseconds
- `MAX_CONTENT_SIZE` - Maximum content size in bytes
- `DEFAULT_TIMEOUT` - Default request timeout in milliseconds

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Implementation Details](./IMPLEMENTATION.md)** - Technical implementation summary
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel or other platforms
- **[Implementation Plan](./docs/hivecrawl-implementation-plan.md)** - Complete technical specification

## � API Documentation

### Base URL

```
http://localhost:5173/api  (development)
https://your-domain.com/api  (production)
```

### 1. Search Endpoint

**GET** `/api/search`

Search the web using DuckDuckGo.

**Query Parameters:**

- `q` (required) - Search query
- `limit` (optional) - Number of results (1-50, default: 10)
- `region` (optional) - Region code (default: wt-wt)

**Example:**

```bash
curl "http://localhost:5173/api/search?q=web+scraping&limit=5"
```

**Response:**

```json
{
	"success": true,
	"data": {
		"query": "web scraping",
		"results": [
			{
				"title": "Web Scraping 101",
				"url": "https://example.com/scraping",
				"snippet": "Learn the basics...",
				"position": 1
			}
		],
		"metadata": {
			"count": 5,
			"fetchTime": 234,
			"region": "wt-wt"
		}
	},
	"error": null
}
```

### 2. Scrape Endpoint

**POST** `/api/scrape`

Scrape content from a single URL with intelligent detection.

**Request Body:**

```json
{
	"url": "https://example.com",
	"format": "markdown",
	"options": {
		"waitFor": "selector or ms",
		"timeout": 30000,
		"screenshot": false,
		"fullPage": true
	}
}
```

**Example:**

```bash
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "format": "markdown"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "title": "Example Page",
    "content": "Page text content...",
    "markdown": "# Example Page\n\nPage content...",
    "metadata": {
      "fetchTime": 1234,
      "method": "cheerio",
      "statusCode": 200,
      "contentType": "text/html",
      "timestamp": "2025-01-07T10:00:00Z"
    },
    "links": [...],
    "images": [...]
  },
  "error": null
}
```

### 3. Crawl Endpoint

**POST** `/api/crawl`

Crawl multiple pages starting from a URL.

**Request Body:**

```json
{
	"url": "https://example.com",
	"maxPages": 50,
	"maxDepth": 3,
	"sameOrigin": true,
	"patterns": {
		"include": ["*/docs/*"],
		"exclude": ["*/api/*"]
	}
}
```

**Example:**

```bash
curl -X POST "http://localhost:5173/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/docs",
    "maxPages": 20,
    "maxDepth": 2
  }'
```

**Response:**

```json
{
	"success": true,
	"data": {
		"pages": [
			{
				"url": "https://example.com",
				"title": "Home",
				"content": "...",
				"markdown": "...",
				"depth": 0
			}
		],
		"metadata": {
			"totalPages": 20,
			"totalTime": 12340,
			"startedAt": "2025-01-07T10:00:00Z",
			"completedAt": "2025-01-07T10:00:12Z"
		}
	},
	"error": null
}
```

## 🧪 Testing

### Test Static Site Scraping

```bash
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","format":"markdown"}'
```

### Test JavaScript-Heavy Site

```bash
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://react-app-example.com","format":"markdown"}'
```

### Test Search

```bash
curl "http://localhost:5173/api/search?q=sveltekit&limit=5"
```

### Test Crawling

```bash
curl -X POST "http://localhost:5173/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":10,"maxDepth":2}'
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

### Other Platforms

The project is configured with `@sveltejs/adapter-vercel`. For other platforms, update `svelte.config.js`:

- **Node.js**: Use `@sveltejs/adapter-node`
- **Cloudflare**: Use `@sveltejs/adapter-cloudflare`
- **Netlify**: Use `@sveltejs/adapter-netlify`

## 🏗️ Architecture

HiveCrawl uses an adaptive scraping strategy:

1. **Try Cheerio first** - Fast static HTML parsing (< 1 second)
2. **Validate content** - Check if content is meaningful
3. **Fallback to Playwright** - If validation fails, use browser automation
4. **Cache decision** - Store preferred method per domain (24-hour TTL)

## 🔒 Security Features

- URL validation and sanitization
- Blocked localhost/private IP ranges
- Content size limits (10MB default)
- Request timeouts
- Rate limiting per IP
- CORS configuration

## 📝 Error Handling

All endpoints return errors in this format:

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

### Error Codes

- `INVALID_URL` - Invalid or malformed URL
- `MISSING_PARAMETER` - Required parameter missing
- `RATE_LIMITED` - Too many requests
- `SCRAPE_FAILED` - Failed to fetch content
- `TIMEOUT` - Request timeout
- `UNSUPPORTED_FORMAT` - Invalid format requested

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Uses [Cheerio](https://cheerio.js.org/) for fast HTML parsing
- Uses [Playwright](https://playwright.dev/) for JavaScript-rendered pages
- Uses [Crawlee](https://crawlee.dev/) for intelligent crawling
- Search powered by [DuckDuckGo](https://duckduckgo.com/)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**HiveCrawl** - Intelligent web scraping made simple 🐝🕷️
