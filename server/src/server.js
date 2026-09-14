const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const apiRouter = require('./routes/api');
const seedDatabase = require('./db/seed');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Enable gzip compression and CORS
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Automatically seed database on startup if empty
try {
  seedDatabase();
} catch (e) {
  console.warn('Initial seeding note:', e.message);
}

// API Routes
app.use('/api', apiRouter);

// Serve static public assets (images, icons, etc.)
const staticAssetPaths = [
  path.join(__dirname, '..', '..', 'client', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', '..', 'client', 'public')
];
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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` Pokémon GO Dex Tracker Server Running! `);
  console.log(` Local URL:    http://localhost:${PORT}  `);
  console.log(` Health Check: http://localhost:${PORT}/api/health `);
  console.log(`=========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
