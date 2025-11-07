# HiveCrawl Quick Start Guide

## � Documentation Navigation

- **[🏠 Main Documentation](./README.md)** - Complete API reference and setup guide
- **[🔧 Implementation Details](./IMPLEMENTATION.md)** - Technical implementation summary
- **[🚀 Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel or other platforms
- **[📋 Implementation Plan](./docs/hivecrawl-implementation-plan.md)** - Complete technical specification

---

## �🚀 Get Started in 5 Minutes

### 1. Prerequisites Check

Ensure you have:

- Node.js 18+ or Bun installed
- Git installed

### 2. Setup (Already Done!)

The project is already set up with all dependencies installed. You're ready to go!

### 3. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5173`

### 4. Test the API

Open a new terminal and try these commands:

#### Test Search (Easy)

```bash
curl "http://localhost:5173/api/search?q=web+scraping&limit=3"
```

Expected: JSON response with search results

#### Test Scraping (Quick)

```bash
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","format":"markdown"}'
```

Expected: JSON with markdown content from example.com

#### Test Crawling (Advanced)

```bash
curl -X POST "http://localhost:5173/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":5,"maxDepth":2}'
```

Expected: JSON with multiple pages crawled

## 📖 API Overview

### 1. Search Endpoint

**URL**: `GET /api/search`

**Parameters**:

- `q` (required) - Search query
- `limit` (optional) - Number of results (1-50)
- `region` (optional) - Region code

**Example**:

```bash
curl "http://localhost:5173/api/search?q=sveltekit&limit=5"
```

### 2. Scrape Endpoint

**URL**: `POST /api/scrape`

**Body**:

```json
{
	"url": "https://example.com",
	"format": "markdown",
	"options": {
		"timeout": 30000,
		"waitFor": ".main-content",
		"screenshot": false
	}
}
```

**Formats**: `markdown`, `html`, `json`

**Example**:

```bash
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","format":"markdown"}'
```

### 3. Crawl Endpoint

**URL**: `POST /api/crawl`

**Body**:

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

**Example**:

```bash
curl -X POST "http://localhost:5173/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","maxPages":10}'
```

## 🎯 Common Use Cases

### 1. Extract Documentation

```bash
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com/guide",
    "format": "markdown"
  }'
```

### 2. Crawl a Blog

```bash
curl -X POST "http://localhost:5173/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://blog.example.com",
    "maxPages": 50,
    "patterns": {
      "include": ["*/posts/*"]
    }
  }'
```

### 3. Search and Scrape

```bash
# 1. Search for pages
curl "http://localhost:5173/api/search?q=sveltekit+tutorial&limit=5"

# 2. Pick a URL from results and scrape it
curl -X POST "http://localhost:5173/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url":"<URL_FROM_SEARCH>","format":"markdown"}'
```

## 🐛 Troubleshooting

### Server won't start?

```bash
# Kill any process on port 5173
lsof -ti:5173 | xargs kill -9

# Try again
npm run dev
```

### Dependencies issues?

```bash
# Reinstall
rm -rf node_modules
npm install
npx playwright install chromium
```

### TypeScript errors?

```bash
# Check for errors
npm run check

# Sync SvelteKit
npm run prepare
```

## 🔧 Environment Configuration

Create a `.env` file (optional):

```env
# Development settings
NODE_ENV=development
ALLOWED_ORIGINS=*

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Scraping
MAX_CONTENT_SIZE=10485760
DEFAULT_TIMEOUT=30000
```

## 📊 Response Format

All endpoints return:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Or on error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

## 🚀 Deploy to Production

### Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Other Platforms

See `README.md` for deployment to:

- Cloudflare Pages/Workers
- Netlify
- Custom Node.js server

## 📚 Learn More

- **[Full Documentation](./README.md)** - Complete API reference and setup guide
- **[Implementation Details](./IMPLEMENTATION.md)** - Technical implementation summary
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel or other platforms
- **[Implementation Plan](./docs/hivecrawl-implementation-plan.md)** - Complete technical specification

## 💡 Tips

1. **Use markdown format** for best readability
2. **Enable screenshot** only when needed (slower)
3. **Start with low maxPages** when crawling (test first)
4. **Check rate limits** to avoid being blocked
5. **Cache is your friend** - same domain = faster scrapes

## 🎉 You're Ready!

Start the server and begin scraping:

```bash
npm run dev
```

Then test with:

```bash
curl "http://localhost:5173/api/search?q=test"
```

Happy crawling! 🐝🕷️
