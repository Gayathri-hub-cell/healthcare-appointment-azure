// ---------------------------------------------------------------------------
// server.js — the entry point of the backend API.
// Run it with:  npm start   (or  npm run dev  to auto-restart on changes)
// ---------------------------------------------------------------------------

// 1) Load variables from the .env file into process.env (local dev).
require('dotenv').config();

// 2) Start Application Insights (Azure monitoring) ONLY if a connection
//    string is provided. Locally this is usually blank, so it's skipped.
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  const appInsights = require('applicationinsights');
  appInsights.setup().setAutoCollectConsole(true, true).start();
}

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { requireAuth } = require('./src/auth');

const app = express();

// Security headers. The Content-Security-Policy must allow the Microsoft
// Entra login endpoints, otherwise the browser blocks sign-in.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'https://login.microsoftonline.com', 'https://*.microsoftonline.com'],
        'frame-src': ["'self'", 'https://login.microsoftonline.com'],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:']
      }
    }
  })
);
app.use(cors());            // allows the React app to call this API
app.use(express.json());    // lets us read JSON request bodies

// A public health check you can open in a browser to confirm the API is up.
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Every route below requires a valid Microsoft Entra ID sign-in token.
app.use('/api/me', requireAuth, require('./src/routes/me'));
app.use('/api/providers', requireAuth, require('./src/routes/providers'));
app.use('/api/appointments', requireAuth, require('./src/routes/appointments'));

// In production we copy the built React app into a "public" folder and the
// API serves it. If that folder isn't there (e.g. during local dev where the
// React app runs separately on port 5173), we simply skip this part.
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
