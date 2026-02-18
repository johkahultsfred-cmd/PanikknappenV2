const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const webpush = require('web-push');

const PORT = Number(process.env.PORT || 4173);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'incidents.json');
const SUBSCRIPTIONS_FILE = path.join(ROOT_DIR, 'data', 'push-subscriptions.json');
const VAPID_KEYS_FILE = path.join(ROOT_DIR, 'data', 'vapid-keys.json');

function ensureDataFile(filePath, defaultContent = '[]') {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf8');
  }
}

function readJson(filePath, fallback) {
  ensureDataFile(filePath, JSON.stringify(fallback));
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDataFile(filePath, JSON.stringify(value));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function readIncidents() {
  const parsed = readJson(DATA_FILE, []);
  return Array.isArray(parsed) ? parsed : [];
}

function writeIncidents(items) {
  writeJson(DATA_FILE, items);
}

function readPushSubscriptions() {
  const parsed = readJson(SUBSCRIPTIONS_FILE, []);
  return Array.isArray(parsed) ? parsed : [];
}

function writePushSubscriptions(items) {
  writeJson(SUBSCRIPTIONS_FILE, items);
}

function getOrCreateVapidKeys() {
  const existing = readJson(VAPID_KEYS_FILE, null);
  if (existing && existing.publicKey && existing.privateKey) {
    return existing;
  }
  const keys = webpush.generateVAPIDKeys();
  writeJson(VAPID_KEYS_FILE, keys);
  return keys;
}

const vapidKeys = getOrCreateVapidKeys();
webpush.setVapidDetails(
  'mailto:panikknappen@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Body för stor'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Ogiltig JSON'));
      }
    });
    req.on('error', reject);
  });
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json' || ext === '.webmanifest') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.ico') return 'image/x-icon';
  return 'text/plain; charset=utf-8';
}

function serveStatic(req, res) {
  const cleanPath = decodeURIComponent(req.url.split('?')[0]);
  let targetPath = path.join(ROOT_DIR, cleanPath);

  if (cleanPath === '/' || cleanPath === '') {
    targetPath = path.join(ROOT_DIR, 'index.html');
  }

  if (!targetPath.startsWith(ROOT_DIR)) {
    sendJson(res, 403, { error: 'Ogiltig sökväg' });
    return;
  }

  fs.stat(targetPath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }

    fs.readFile(targetPath, (readError, data) => {
      if (readError) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Hittade inte filen');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentTypeFor(targetPath) });
      res.end(data);
    });
  });
}

async function notifyFamily(incident) {
  const all = readPushSubscriptions();
  const targets = all.filter((item) => item.familyId === incident.familyId && item.subscription?.endpoint);

  if (!targets.length) {
    return { sent: 0, removed: 0 };
  }

  const payload = JSON.stringify({
    title: '🚨 Paniklarm',
    body: `Nytt larm från ${incident.childId}`,
    familyId: incident.familyId,
    incidentId: incident.id,
    timestamp: incident.timestamp,
    url: `/apps/family/?familyId=${encodeURIComponent(incident.familyId)}`
  });

  let sent = 0;
  const invalidEndpoints = new Set();

  await Promise.all(
    targets.map(async (item) => {
      try {
        await webpush.sendNotification(item.subscription, payload);
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          invalidEndpoints.add(item.subscription.endpoint);
        }
      }
    })
  );

  if (invalidEndpoints.size) {
    const filtered = all.filter((item) => !invalidEndpoints.has(item.subscription?.endpoint));
    writePushSubscriptions(filtered);
  }

  return { sent, removed: invalidEndpoints.size };
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/push/public-key') {
    sendJson(res, 200, { publicKey: vapidKeys.publicKey });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/push/subscribe') {
    const body = await parseBody(req);
    if (!body.subscription || !body.subscription.endpoint) {
      sendJson(res, 400, { error: 'subscription krävs' });
      return;
    }

    const familyId = body.familyId || 'family-demo-1';
    const all = readPushSubscriptions();
    const withoutCurrent = all.filter((item) => item.subscription.endpoint !== body.subscription.endpoint);
    withoutCurrent.unshift({
      id: randomUUID(),
      familyId,
      createdAt: new Date().toISOString(),
      subscription: body.subscription
    });
    writePushSubscriptions(withoutCurrent.slice(0, 500));

    sendJson(res, 201, { ok: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/push/unsubscribe') {
    const body = await parseBody(req);
    const endpoint = body?.endpoint;
    if (!endpoint) {
      sendJson(res, 400, { error: 'endpoint krävs' });
      return;
    }

    const all = readPushSubscriptions();
    const filtered = all.filter((item) => item.subscription.endpoint !== endpoint);
    writePushSubscriptions(filtered);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/incidents') {
    const familyId = url.searchParams.get('familyId');
    const incidents = readIncidents()
      .filter((item) => !familyId || item.familyId === familyId)
      .sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')));
    sendJson(res, 200, { incidents });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/incidents') {
    const body = await parseBody(req);
    if (!body.childId || !body.familyId) {
      sendJson(res, 400, { error: 'childId och familyId krävs' });
      return;
    }

    const incident = {
      id: randomUUID(),
      childId: body.childId,
      familyId: body.familyId,
      timestamp: body.timestamp || new Date().toISOString(),
      status: body.status || 'ny',
      screenshotUrl: body.screenshotUrl || '',
      location: body.location || null,
      actions: Array.isArray(body.actions) ? body.actions : [],
      triggerType: body.triggerType || 'unknown',
      source: body.source || 'child-app'
    };

    const incidents = readIncidents();
    incidents.unshift(incident);
    writeIncidents(incidents.slice(0, 200));

    const pushResult = await notifyFamily(incident);
    sendJson(res, 201, { incident, push: pushResult });
    return;
  }

  if (req.method === 'PATCH' && /^\/api\/incidents\/.+/.test(url.pathname)) {
    const incidentId = url.pathname.split('/').pop();
    const body = await parseBody(req);
    const incidents = readIncidents();
    const idx = incidents.findIndex((item) => item.id === incidentId);

    if (idx === -1) {
      sendJson(res, 404, { error: 'Incident hittades inte' });
      return;
    }

    incidents[idx] = {
      ...incidents[idx],
      status: body.status || incidents[idx].status,
      handledAt: body.handledAt || incidents[idx].handledAt || new Date().toISOString()
    };

    writeIncidents(incidents);
    sendJson(res, 200, { incident: incidents[idx] });
    return;
  }

  sendJson(res, 404, { error: 'API-endpoint hittades inte' });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      await handleApi(req, res);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: 'Internt serverfel', detail: error.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  ensureDataFile(DATA_FILE, '[]');
  ensureDataFile(SUBSCRIPTIONS_FILE, '[]');
  console.log(`Panikknappen server kör på http://0.0.0.0:${PORT}`);
});
