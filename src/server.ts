import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { timingSafeEqual, randomBytes } from 'node:crypto';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const backendBaseUrl =
  process.env['BACKEND_URL'] ?? 'http://localhost:8080';
const loginUser = process.env['LOGIN_USER'] ?? process.env['ADMIN_USER'];
const loginPassword =
  process.env['LOGIN_PASSWORD'] ?? process.env['ADMIN_PASSWORD'];
const authCookieName = 'buyfast_auth';
const authSessionValue =
  process.env['AUTH_SESSION_TOKEN'] ?? randomBytes(32).toString('hex');
const credentialsConfigured = Boolean(loginUser && loginPassword);
const shouldProxyRequestBody = (method: string) =>
  method !== 'GET' && method !== 'HEAD';

const app = express();
app.set('trust proxy', true);

const appendHosts = (hosts: Set<string>, rawEntries?: string) => {
  if (!rawEntries) {
    return;
  }

  for (const entry of rawEntries.split(',')) {
    const trimmedEntry = entry.trim();
    if (!trimmedEntry) {
      continue;
    }

    try {
      const parsedUrl = new URL(trimmedEntry);
      if (parsedUrl.hostname) {
        hosts.add(parsedUrl.hostname);
      }
      continue;
    } catch {
      // Not a full URL; treat it as a hostname or wildcard entry.
    }

    const normalizedHost = trimmedEntry
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '');

    if (normalizedHost) {
      hosts.add(normalizedHost);
    }
  }
};

const getAllowedHosts = () => {
  const hosts = new Set<string>([
    'localhost',
    '127.0.0.1',
    'buyfast.yanz-academy.online',
    '*.yanz-academy.online',
  ]);

  appendHosts(hosts, process.env['NG_ALLOWED_HOSTS']);
  appendHosts(hosts, process.env['ALLOWED_HOSTS']);
  appendHosts(hosts, process.env['APP_URL']);
  appendHosts(hosts, process.env['PUBLIC_URL']);
  appendHosts(hosts, process.env['SITE_URL']);

  return [...hosts];
};

const allowedHosts = getAllowedHosts();
const angularApp = new AngularNodeAppEngine({ allowedHosts });

const getCookieValue = (cookieHeader: string | undefined, key: string) => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, ...rawValue] = cookie.trim().split('=');
    if (name === key) {
      return decodeURIComponent(rawValue.join('='));
    }
  }

  return null;
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const isAuthenticated = (cookieHeader: string | undefined) => {
  const cookieValue = getCookieValue(cookieHeader, authCookieName);
  if (!cookieValue) {
    return false;
  }

  return safeEqual(cookieValue, authSessionValue);
};

const buildAuthCookie = (isSecure: boolean, maxAgeSeconds: number) => {
  const cookieParts = [
    `${authCookieName}=${encodeURIComponent(authSessionValue)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
};

const buildLogoutCookie = (isSecure: boolean) => {
  const cookieParts = [
    `${authCookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
};

const requestIsSecure = (req: express.Request) =>
  req.secure || req.get('x-forwarded-proto') === 'https';

app.post('/api/auth/login', express.json(), (req, res) => {
  if (!credentialsConfigured) {
    res.status(500).json({
      message:
        'Credenciales no configuradas. Define LOGIN_USER y LOGIN_PASSWORD en Dokploy.',
    });
    return;
  }

  const { user, password } = (req.body ?? {}) as {
    user?: string;
    password?: string;
  };

  const userValue = user ?? '';
  const passwordValue = password ?? '';

  const isValidUser = safeEqual(userValue, loginUser!);
  const isValidPassword = safeEqual(passwordValue, loginPassword!);

  if (!isValidUser || !isValidPassword) {
    res.status(401).json({ message: 'Usuario o contraseña inválidos.' });
    return;
  }

  res.setHeader(
    'Set-Cookie',
    buildAuthCookie(requestIsSecure(req), 60 * 60 * 12),
  );
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', buildLogoutCookie(requestIsSecure(req)));
  res.json({ ok: true });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: isAuthenticated(req.headers.cookie) });
});

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

app.use((req, res, next) => {
  if (req.path === '/login') {
    next();
    return;
  }

  if (req.path.startsWith('/api')) {
    next();
    return;
  }

  if (req.path.includes('.') || req.path.startsWith('/assets')) {
    next();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }

  if (!credentialsConfigured) {
    res.redirect('/login?error=config');
    return;
  }

  if (!isAuthenticated(req.headers.cookie)) {
    const redirectTo = encodeURIComponent(req.originalUrl || '/');
    res.redirect(`/login?redirect=${redirectTo}`);
    return;
  }

  next();
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
    console.log(`Angular SSR allowed hosts: ${allowedHosts.join(', ')}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
