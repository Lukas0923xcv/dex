const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const apiRouter = require('./routes/api');
const seedDatabase = require('./db/seed');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Enable trust proxy for Cloudflare Tunnel / reverse proxy headers
app.set('trust proxy', 1);

// Security: Disable X-Powered-By banner
app.disable('x-powered-by');

// Security Headers middleware (protect against Clickjacking, MIME sniffing, XSS, etc.)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; font-src 'self' data:; worker-src 'self' blob:; manifest-src 'self';"
  );
  next();
});

// Enable gzip compression and CORS
app.use(compression());

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : [];

// Secure dynamic CORS origin validation
app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  let isAllowed = false;

  if (!origin) {
    // 1. Allow requests with no origin (mobile PWA, curl, same-origin)
    isAllowed = true;
  } else if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    // 2. Allow local development and loopback origins
    isAllowed = true;
  } else if (origin === 'https://lukas0923xcv.github.io' || origin === 'http://lukas0923xcv.github.io') {
    // 3. Allow official GitHub Pages deployment
    isAllowed = true;
  } else if (configuredOrigins.includes(origin)) {
    // 4. Allow user-configured origins from CORS_ORIGIN
    isAllowed = true;
  } else {
    // 5. Allow if origin matches Host, X-Forwarded-Host, or exact server-lukas.com domain / subdomains
    try {
      const parsedOrigin = new URL(origin);
      const hostHeader = (req.header('x-forwarded-host') || req.header('host') || '').split(':')[0].toLowerCase();
      const originHost = parsedOrigin.hostname.toLowerCase();
      const isDomainAllowed = originHost === 'server-lukas.com' || originHost.endsWith('.server-lukas.com');
      if ((hostHeader && originHost === hostHeader) || isDomainAllowed) {
        isAllowed = true;
      }
    } catch {}
  }

  callback(null, { origin: isAllowed, credentials: isAllowed });
}));

// In-Memory Sliding-Window Rate Limiter
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 300;
  const message = options.message || { error: 'Too many requests, please try again later.' };
  const hits = new Map();

  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000);
  if (interval.unref) interval.unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = (hits.get(ip) || []).filter(t => now - t < windowMs);

    if (timestamps.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json(message);
    }

    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}

// Global API rate limiter (300 requests / 15 min per IP)
const globalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300
});

// Stricter rate limiter for resource-heavy mutation and proxy endpoints (60 req / min)
const heavyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Rate limit exceeded for resource-intensive requests. Please slow down.' }
});

app.use('/api', globalApiLimiter);
app.use(['/api/import', '/api/proxy-image', '/api/progress/batch'], heavyLimiter);

app.use(express.json({ limit: '10mb' }));

// Automatically seed database on startup if empty
try {
  seedDatabase();
} catch (e) {
  console.warn('Initial seeding note:', e.message);
}

// Prevent Cloudflare Edge CDN & browsers from caching dynamic API state
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// API Routes
app.use('/api', apiRouter);

// Serve static public assets (images, icons, etc.)
const staticAssetPaths = [
  path.join(__dirname, '..', '..', 'client', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', '..', 'client', 'public')
];

// Ensure Service Worker is served with appropriate headers (scope, no-cache)
app.get('/sw.js', (req, res, next) => {
  for (const assetPath of staticAssetPaths) {
    const swFile = path.join(assetPath, 'sw.js');
    if (fs.existsSync(swFile)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(swFile);
    }
  }
  next();
});

// Ensure Web App Manifest has proper application/manifest+json MIME type
app.get(['/manifest.json', '/manifest.webmanifest'], (req, res, next) => {
  for (const assetPath of staticAssetPaths) {
    const manifestFile = path.join(assetPath, 'manifest.json');
    if (fs.existsSync(manifestFile)) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      return res.sendFile(manifestFile);
    }
  }
  next();
});

// Ensure Apple Touch Icons are served directly from root if requested by iOS Safari
app.get(['/apple-touch-icon.png', '/apple-touch-icon-precomposed.png'], (req, res, next) => {
  for (const assetPath of staticAssetPaths) {
    const iconFile = path.join(assetPath, 'apple-touch-icon.png');
    if (fs.existsSync(iconFile)) {
      res.setHeader('Content-Type', 'image/png');
      return res.sendFile(iconFile);
    }
  }
  next();
});

for (const assetPath of staticAssetPaths) {
  if (fs.existsSync(assetPath)) {
    app.use(express.static(assetPath));
  }
}

// Serve static frontend build if present
const clientDistPaths = [
  path.join(__dirname, '..', '..', 'client', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'dist')
];

let staticServed = false;
for (const distPath of clientDistPaths) {
  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log(`Serving static client from: ${distPath}`);
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
    staticServed = true;
    break;
  }
}

if (!staticServed) {
  app.get('/', (req, res) => {
    res.json({
      message: 'Pokémon GO Dex Tracker API is running.',
      docs: '/api/health',
      hint: 'Client build not found. Run "npm run build:client" or access client development server.'
    });
  });
}

const BIND_HOST = process.env.BIND_IP || process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, BIND_HOST, () => {
  console.log(`=========================================`);
  console.log(` Pokémon GO Dex Tracker Server Running! `);
  console.log(` Local URL:    http://${BIND_HOST === '0.0.0.0' ? 'localhost' : BIND_HOST}:${PORT} `);
  console.log(` Health Check: http://${BIND_HOST === '0.0.0.0' ? 'localhost' : BIND_HOST}:${PORT}/api/health `);
  console.log(`=========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
