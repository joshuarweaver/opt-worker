# Image Optimizer Cloudflare Worker

A high-performance Cloudflare Worker that automatically optimizes images and improves Core Web Vitals (CWV) scores for your website.

## 🚀 Features

### Image Optimizations
- **Lazy Loading**: Automatically adds `loading="lazy"` to all images
- **Async Decoding**: Adds `decoding="async"` for better performance
- **Smart Priority**: Sets first image to `fetchpriority="high"` (LCP optimization)
- **Low Priority**: Sets subsequent images to `fetchpriority="low"`

### Core Web Vitals Improvements
- **Preconnect Links**: Adds preconnect for common third-party domains
- **DNS Prefetch**: Reduces DNS lookup times
- **CSS Optimization**: Converts render-blocking CSS to non-blocking using preload
- **Viewport Meta**: Ensures proper mobile viewport configuration
- **Security Headers**: Adds performance and security headers

## 📊 Expected Performance Gains

Based on your current CWV scores of 58-66, this worker can help improve:
- **Largest Contentful Paint (LCP)**: 10-20% improvement through image priority optimization
- **Cumulative Layout Shift (CLS)**: Reduced through proper image lazy loading
- **First Input Delay (FID)**: Improved through CSS optimization and resource hints

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Cloudflare account
- Wrangler CLI installed globally: `npm install -g wrangler`

### 1. Install Dependencies
```bash
npm install
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Configure wrangler.toml
Edit `wrangler.toml` and update:
- `account_id`: Your Cloudflare account ID
- Routes configuration for your domain

Example:
```toml
account_id = "your-account-id-here"

[[routes]]
pattern = "yoursite.com/*"
zone_name = "yoursite.com"
```

### 4. Deploy
```bash
npm run deploy
```

## 🧪 Local Development

Test the worker locally:
```bash
npm run dev
```

This will start a local development server where you can test the optimizations.

## 📈 Performance Monitoring

### Available Commands
- `npm run dev` - Start local development server
- `npm run deploy` - Deploy to Cloudflare
- `npm run tail` - View real-time logs
- `npm run test` - Test locally without internet

### Monitoring
After deployment, monitor performance improvements:
1. Use Google PageSpeed Insights
2. Check Core Web Vitals in Google Search Console
3. Monitor Cloudflare Analytics for worker performance

## 🔧 Customization

### Adding More Optimizations
The worker can be extended with additional optimizations:

```javascript
// Add to src/index.js

// Optimize font loading
html = html.replace(
  /<link([^>]+)href="[^"]*fonts\.googleapis\.com[^>]+>/gi,
  (match) => match.replace('rel="stylesheet"', 'rel="preload" as="style"')
);

// Add critical CSS inlining
// Add WebP image format conversion
// Add responsive image srcset generation
```

### Environment Configuration
Add environment-specific settings in `wrangler.toml`:

```toml
[env.production.vars]
ENVIRONMENT = "production"
CACHE_TTL = "31536000"

[env.staging.vars]
ENVIRONMENT = "staging"
CACHE_TTL = "3600"
```

## 🚨 Important Notes

1. **Test Thoroughly**: Always test the worker with your specific site before deploying to production
2. **Cache Headers**: The worker sets aggressive caching headers - ensure this fits your needs
3. **CSS Optimization**: The CSS preload optimization might affect critical above-the-fold styles
4. **Route Configuration**: Make sure your routes are configured correctly to avoid conflicts

## 📊 Expected Results

With your current CWV scores of 58-66, implementing this worker should help achieve:
- **Target LCP**: < 2.5 seconds
- **Target FID**: < 100 milliseconds  
- **Target CLS**: < 0.1

## 🐛 Troubleshooting

### Common Issues
1. **Worker not triggering**: Check route configuration in wrangler.toml
2. **CSS broken**: Review CSS optimization rules and add exceptions for critical CSS
3. **Images not optimizing**: Ensure HTML content-type detection is working

### Debug Mode
Add debug logging to the worker:
```javascript
console.log('Processing:', request.url);
console.log('Content-Type:', contentType);
```

View logs with: `npm run tail`

## 📄 License

MIT License - Feel free to modify and use for your projects!

---

**Pro Tip**: Combine this worker with Cloudflare's built-in image optimization features for maximum performance gains! 