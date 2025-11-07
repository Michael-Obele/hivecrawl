# HiveCrawl Deployment Guide

## 📚 Documentation Navigation

- **[🏠 Main Documentation](./README.md)** - Complete API reference and setup guide
- **[⚡ Quick Start Guide](./QUICKSTART.md)** - 5-minute setup and basic usage
- **[🔧 Implementation Details](./IMPLEMENTATION.md)** - Technical implementation summary
- **[📋 Implementation Plan](./docs/hivecrawl-implementation-plan.md)** - Complete technical specification

---

## 🚀 Deploy to Production

- Vercel account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- HiveCrawl project ready

## Method 1: Deploy via Vercel Dashboard (Easiest)

### 1. Push to Git

```bash
git init
git add .
git commit -m "Initial HiveCrawl implementation"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect SvelteKit
5. Click "Deploy"

### 3. Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables:

```
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
MAX_CONTENT_SIZE=10485760
DEFAULT_TIMEOUT=30000
NODE_ENV=production
```

### 4. Done!

Your API will be available at:

```
https://your-project.vercel.app/api/search
https://your-project.vercel.app/api/scrape
https://your-project.vercel.app/api/crawl
```

## Method 2: Deploy via Vercel CLI

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# First deployment (development)
vercel

# Production deployment
vercel --prod
```

### 4. Set Environment Variables

```bash
vercel env add ALLOWED_ORIGINS
# Enter: https://yourdomain.com

vercel env add RATE_LIMIT_MAX
# Enter: 100

vercel env add NODE_ENV
# Enter: production
```

### 5. Redeploy with Environment Variables

```bash
vercel --prod
```

## Vercel Configuration

The project includes optimal Vercel configuration in `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter()
	}
};
```

### Advanced Configuration (Optional)

Create `vercel.json` for custom settings:

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

## Important Vercel Considerations

### 1. Playwright Support

Vercel supports Playwright! The `@playwright/test` package works in Vercel serverless functions.

**Important**: Playwright adds ~50MB to your deployment. Consider:

- Using Cheerio-only mode for lighter deployments
- Using external browser service like [Browserless.io](https://browserless.io) for production

### 2. Function Timeouts

Free tier: 10 seconds
Pro tier: 60 seconds

Adjust in `vercel.json`:

```json
{
	"functions": {
		"api/scrape/+server.ts": {
			"maxDuration": 60
		},
		"api/crawl/+server.ts": {
			"maxDuration": 60
		}
	}
}
```

### 3. Memory Limits

Free tier: 1024MB
Pro tier: 3008MB

Playwright can use significant memory. Monitor usage in Vercel dashboard.

### 4. Cold Starts

First request may be slow (2-5 seconds) due to:

- Playwright browser initialization
- Lambda cold start

Solutions:

- Keep functions warm with health check pings
- Use edge functions for critical paths
- Implement caching aggressively

## Testing Production Deployment

### 1. Test Search

```bash
curl "https://your-project.vercel.app/api/search?q=test&limit=5"
```

### 2. Test Scraping

```bash
curl -X POST "https://your-project.vercel.app/api/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "format": "markdown"
  }'
```

### 3. Test Crawling

```bash
curl -X POST "https://your-project.vercel.app/api/crawl" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "maxPages": 10,
    "maxDepth": 2
  }'
```

## Custom Domain

### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain: `api.yourdomain.com`
3. Configure DNS records as shown

### 2. Update CORS

Update `ALLOWED_ORIGINS` environment variable:

```
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 3. Use Your API

```
https://api.yourdomain.com/api/search
https://api.yourdomain.com/api/scrape
https://api.yourdomain.com/api/crawl
```

## Monitoring & Analytics

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `src/routes/+layout.svelte`:

```svelte
<script>
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
</script>
```

### 2. Monitor Function Logs

In Vercel dashboard:

- Deployments → View Function Logs
- Monitor errors and performance
- Set up alerts for failures

### 3. Track Usage

Monitor:

- Request count
- Response times
- Error rates
- Memory usage
- Function duration

## Scaling Considerations

### Free Tier Limits

- 100GB bandwidth/month
- 100 hours function execution/month
- 10 second max duration
- 1024MB memory

### Upgrade to Pro When You Need

- More bandwidth
- Longer timeouts (60s)
- More memory (3008MB)
- Priority support
- Advanced analytics

## Optimization Tips

### 1. Reduce Bundle Size

```bash
# Analyze bundle
npm run build
# Check .vercel/output for size
```

### 2. Cache Aggressively

Already implemented:

- Domain method cache (24h)
- In-memory caching with node-cache

### 3. Use Edge Middleware

For rate limiting and auth, consider Vercel Edge Middleware:

```typescript
// middleware.ts
export function middleware(request: Request) {
  // Fast edge-based rate limiting
}
```

### 4. Optimize Playwright

```typescript
// Only install when needed
if (needsJavaScript) {
  const playwright = await import('playwright');
  // Use playwright
}
```

## Troubleshooting

### Build Fails

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npm run check
```

### Function Timeouts

- Increase `maxDuration` in vercel.json
- Optimize scraping logic
- Add timeout to requests

### Memory Errors

- Use Cheerio instead of Playwright when possible
- Close browser instances properly
- Increase function memory

### Rate Limiting

- Implement proper rate limiting
- Use Vercel Edge Config for distributed rate limiting
- Consider Redis for production rate limiting

## Security Checklist

- [x] CORS configured via ALLOWED_ORIGINS
- [x] Rate limiting implemented
- [x] URL validation in place
- [x] No sensitive data in public env vars
- [x] Content size limits enforced
- [x] Timeout protection active

## Environment Variables Reference

Required:

```
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

Optional (with defaults):

```
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
MAX_CONTENT_SIZE=10485760
DEFAULT_TIMEOUT=30000
```

## Next Steps

After deployment:

1. ✅ Test all endpoints
2. ✅ Set up monitoring
3. ✅ Configure custom domain
4. ✅ Update CORS settings
5. ✅ Monitor usage and costs
6. ✅ Optimize as needed

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- SvelteKit Docs: [kit.svelte.dev](https://kit.svelte.dev)
- Playwright on Vercel: [vercel.com/guides/playwright](https://vercel.com/guides/playwright)

## 📚 Related Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Full Documentation](./README.md)** - Complete API reference and setup guide
- **[Implementation Details](./IMPLEMENTATION.md)** - Technical implementation summary
- **[Implementation Plan](./docs/hivecrawl-implementation-plan.md)** - Complete technical specification

---

**Your HiveCrawl API is now live! 🚀**
