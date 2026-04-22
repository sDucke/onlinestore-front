import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const backendBaseUrl =
  process.env['BACKEND_URL'] ?? 'http://localhost:8080';
const shouldProxyRequestBody = (method: string) =>
  method !== 'GET' && method !== 'HEAD';

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use('/api', async (req, res, next) => {
  try {
    const targetUrl = new URL(req.originalUrl, backendBaseUrl);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (key === 'host' || value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      } else {
        headers.set(key, value);
      }
    }

    const requestInit = {
      method: req.method,
      headers,
      body: shouldProxyRequestBody(req.method)
        ? (req as unknown as BodyInit)
        : undefined,
      duplex: shouldProxyRequestBody(req.method) ? 'half' : undefined,
    } as RequestInit & { duplex?: 'half' };

    const upstreamResponse = await fetch(targetUrl, requestInit);

    res.status(upstreamResponse.status);

    upstreamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (!upstreamResponse.body) {
      res.end();
      return;
    }

    for await (const chunk of upstreamResponse.body) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
