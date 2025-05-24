export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const contentType = response.headers.get("content-type") || "";

    // Only rewrite HTML pages
    if (!contentType.includes("text/html")) {
      return response;
    }

    let html = await response.text();

    // Inject lazy loading and decoding on all <img> tags
    html = html.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
      if (attrs.includes("loading=")) return match; // skip if already optimized

      const hasFetchPriority = attrs.includes("fetchpriority=");
      const lazyAttrs = `loading="lazy" decoding="async"${hasFetchPriority ? "" : " fetchpriority=\"low\""}`;

      return `<img ${attrs} ${lazyAttrs}>`;
    });

    // Upgrade first image to fetchpriority="high" (assume it's LCP)
    html = html.replace(/<img([^>]+?)fetchpriority="low"/i, (match, attrs) => {
      return `<img${attrs}fetchpriority="high"`;
    });

    // Additional CWV optimizations
    
    // Add preconnect for common third-party domains if not present
    if (!html.includes('rel="preconnect"')) {
      const headInsert = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://www.google-analytics.com">
    <link rel="preconnect" href="https://www.googletagmanager.com">
`;
      html = html.replace(/<head>/i, `<head>${headInsert}`);
    }

    // Add viewport meta tag if missing (important for mobile CWV)
    if (!html.includes('name="viewport"')) {
      const viewportTag = '\n    <meta name="viewport" content="width=device-width, initial-scale=1">';
      html = html.replace(/<head>/i, `<head>${viewportTag}`);
    }

    // Optimize CSS delivery - but be careful with worker-served CSS
    html = html.replace(
      /<link([^>]+)rel=["']stylesheet["']([^>]+)>/gi, 
      (match, beforeRel, afterRel) => {
        // Skip if already optimized, is critical CSS, or contains worker-like patterns
        if (match.includes('media=') || 
            match.includes('critical') || 
            match.includes('above-fold') ||
            match.includes('/_worker') ||
            match.includes('/workers/') ||
            afterRel.includes('/_worker') ||
            afterRel.includes('/workers/') ||
            beforeRel.includes('/_worker') ||
            beforeRel.includes('/workers/')) {
          return match;
        }
        
        // Also skip if the URL looks like it might be worker-served (no file extension or special patterns)
        const hrefMatch = match.match(/href=["']([^"']+)["']/);
        if (hrefMatch) {
          const href = hrefMatch[1];
          // Skip if no extension, or looks like a worker path
          if (!href.includes('.css') || 
              href.startsWith('/_') || 
              href.includes('/api/') ||
              href.includes('/edge/')) {
            return match;
          }
        }
        
        return `<link${beforeRel}rel="preload"${afterRel} as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link${beforeRel}rel="stylesheet"${afterRel}></noscript>`;
      }
    );

    // Add resource hints for better performance
    if (!html.includes('rel="dns-prefetch"')) {
      const dnsHints = `
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//www.google-analytics.com">
`;
      html = html.replace(/<head>/i, `<head>${dnsHints}`);
    }

    // Create new response with optimized headers
    const optimizedResponse = new Response(html, {
      status: response.status,
      headers: new Headers(response.headers),
    });

    // Add performance headers (but less aggressive caching for HTML)
    optimizedResponse.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    optimizedResponse.headers.set('X-Content-Type-Options', 'nosniff');
    optimizedResponse.headers.set('X-Frame-Options', 'DENY');
    optimizedResponse.headers.set('X-XSS-Protection', '1; mode=block');
    
    return optimizedResponse;
  }
}; 