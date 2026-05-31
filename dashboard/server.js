const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTS = (process.env.SUPPORT_PORTS || process.env.PORT || '8086')
  .split(',')
  .map((port) => Number(port.trim()))
  .filter(Boolean);
const SEED_DB_PATH = path.resolve(__dirname, '..', 'database', 'local-db.json');
const DB_PATH = path.resolve(process.env.SUPPORT_DB_PATH || path.join(__dirname, 'data', 'local-db.json'));
const BUILD_PATH = path.resolve(__dirname, 'build');
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const PUBLIC_READ_ONLY = process.env.PUBLIC_READ_ONLY === 'true';

if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.copyFileSync(SEED_DB_PATH, DB_PATH);
}

const readDb = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDb = (db) => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

const send = (res, status, payload) => {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, client_id, client_secret',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
};

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
};

const serveStatic = (req, res, url) => {
  if (req.method !== 'GET' || !fs.existsSync(BUILD_PATH)) {
    return send(res, 404, { errorMessage: 'Resource not found' });
  }

  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(BUILD_PATH, `.${requestedPath}`);
  const safePath = filePath.startsWith(BUILD_PATH) ? filePath : path.join(BUILD_PATH, 'index.html');
  const finalPath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(BUILD_PATH, 'index.html');
  const ext = path.extname(finalPath);

  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
  });
  fs.createReadStream(finalPath).pipe(res);
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });

const extractOrderId = (text) => (text.match(/ORD-\d+/i) || [])[0]?.toUpperCase();

const detectIntent = (query) => {
  const text = query.toLowerCase();
  if (text.includes('public api') || text.includes('scrape') || text.includes('weather data')) return 'public_api_discovery';
  if (text.includes('order') || text.includes('tracking') || text.includes('delivery')) return 'order_status';
  if (text.includes('loyalty') || text.includes('points') || text.includes('account') || text.includes('customer')) return 'customer_info';
  if (text.includes('damaged') || text.includes('complaint') || text.includes('broken') || text.includes('issue')) return 'complaint';
  return 'general';
};

const discoverPublicApis = async (query) => {
  try {
    const response = await fetch('https://api.apis.guru/v2/list.json');
    const catalog = await response.json();
    const needle = query.toLowerCase().includes('weather') ? 'weather' : '';
    return Object.entries(catalog)
      .filter(([name, item]) => !needle || name.toLowerCase().includes(needle) || JSON.stringify(item).toLowerCase().includes(needle))
      .slice(0, 5)
      .map(([name, item]) => ({
        name,
        title: item.info?.title || name,
        description: item.info?.description || 'Public API metadata from APIs.guru',
        url: item.url,
      }));
  } catch (error) {
    return [
      {
        name: 'open-meteo.com',
        title: 'Open-Meteo',
        description: 'Free weather forecast API that does not require an API key for basic use.',
        url: 'https://open-meteo.com/en/docs',
      },
      {
        name: 'data.gov',
        title: 'Data.gov APIs',
        description: 'US public datasets and API catalog. Some APIs are open, some require a user-created key.',
        url: 'https://api.data.gov/',
      },
    ];
  }
};

const handleQuery = async (body) => {
  const db = readDb();
  const intent = detectIntent(body.query || '');
  const customerId = body.customerId || 'GUEST';
  const timestamp = new Date().toISOString();
  let message = 'Thanks for contacting support. I saved your query and a support agent can review it if needed.';
  let data = {};

  if (intent === 'order_status') {
    const orderId = extractOrderId(body.query || '') || db.orders.find((order) => order.customerId === customerId)?.orderId;
    const order = db.orders.find((item) => item.orderId === orderId);
    data = order || {};
    message = order
      ? `Order ${order.orderId} is ${order.status}. Tracking number ${order.trackingNumber}, expected delivery ${order.expectedDelivery}.`
      : 'I could not find that order. Try a sample order like ORD-5521.';
  }

  if (intent === 'customer_info') {
    const customer = db.customers.find((item) => item.id === customerId);
    data = customer || {};
    message = customer
      ? `${customer.name} is on the ${customer.loyaltyTier} tier with ${customer.rewardPoints} reward points.`
      : 'I could not find that customer. Try CUST-001, CUST-002, or CUST-003.';
  }

  if (intent === 'complaint') {
    data = {
      ticketId: `TKT-${Date.now()}`,
      status: 'OPEN',
      severity: 'HIGH',
      assignedTeam: 'Escalation Team',
    };
    message = `I created ticket ${data.ticketId}. The escalation team will review it within 24 hours.`;
  }

  if (intent === 'public_api_discovery') {
    data = { apis: await discoverPublicApis(body.query || '') };
    message = 'I found public API options. These are public catalogs or key-free APIs, not scraped secrets.';
  }

  const record = {
    id: `Q-${Date.now()}`,
    query: body.query,
    customerId,
    intent,
    status: intent === 'complaint' ? 'open' : 'resolved',
    message,
    data,
    timestamp,
  };

  db.queries.unshift(record);
  db.conversations.push({ sessionId: body.sessionId, customerId, role: 'user', content: body.query, timestamp });
  db.conversations.push({ sessionId: body.sessionId, customerId, role: 'assistant', content: message, timestamp });
  writeDb(db);

  return { requestId: record.id, intent, message, data, timestamp };
};

const getStats = (db) => {
  const totalQueries = db.queries.length;
  const resolvedQueries = db.queries.filter((query) => query.status === 'resolved').length;
  return {
    totalQueries,
    resolvedQueries,
    avgResolutionTime: totalQueries ? 4 : 0,
    satisfactionRate: totalQueries ? 92 : 0,
  };
};

const getTrends = (db) => {
  const days = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const dayQueries = db.queries.filter((query) => query.timestamp?.startsWith(key));
    return {
      date: key.slice(5),
      queries: dayQueries.length,
      resolved: dayQueries.filter((query) => query.status === 'resolved').length,
    };
  });
  return days;
};

const getIntents = (db) => {
  const counts = db.queries.reduce((acc, query) => {
    acc[query.intent] = (acc[query.intent] || 0) + 1;
    return acc;
  }, {});
  const fallback = { order_status: 3, customer_info: 2, complaint: 1, public_api_discovery: 1, general: 1 };
  const source = Object.keys(counts).length ? counts : fallback;
  return Object.entries(source).map(([name, value]) => ({ name: name.replaceAll('_', ' '), value }));
};

const requestHandler = async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const db = readDb();

  try {
    if (req.method === 'GET' && url.pathname === '/api/v1/support/health') {
      return send(res, 200, { status: 'UP', timestamp: new Date().toISOString(), database: DB_PATH });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/support/query') {
      const body = await parseBody(req);
      if (!body.query) return send(res, 400, { errorMessage: 'query is required' });
      return send(res, 200, await handleQuery(body));
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/support/analytics/stats') return send(res, 200, getStats(db));
    if (req.method === 'GET' && url.pathname === '/api/v1/support/analytics/trends') return send(res, 200, getTrends(db));
    if (req.method === 'GET' && url.pathname === '/api/v1/support/analytics/intents') return send(res, 200, getIntents(db));

    if (req.method === 'GET' && url.pathname === '/api/v1/support/queries/recent') {
      const limit = Number(url.searchParams.get('limit') || 10);
      return send(res, 200, db.queries.slice(0, limit));
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/support/admin/customers') return send(res, 200, db.customers);
    if (req.method === 'GET' && url.pathname === '/api/v1/support/admin/orders') return send(res, 200, db.orders);

    if (req.method === 'POST' && url.pathname === '/api/v1/support/admin/customers') {
      if (PUBLIC_READ_ONLY) return send(res, 403, { errorMessage: 'Admin writes are disabled on this public endpoint' });
      const body = await parseBody(req);
      if (!body.id || !body.name || !body.email) return send(res, 400, { errorMessage: 'id, name, and email are required' });
      db.customers.push({ ...body, totalSpending: Number(body.totalSpending || 0), isActive: true });
      writeDb(db);
      return send(res, 201, body);
    }

    const customerMatch = url.pathname.match(/^\/api\/v1\/support\/admin\/customers\/([^/]+)$/);
    if (customerMatch && req.method === 'PUT') {
      if (PUBLIC_READ_ONLY) return send(res, 403, { errorMessage: 'Admin writes are disabled on this public endpoint' });
      const body = await parseBody(req);
      const index = db.customers.findIndex((customer) => customer.id === customerMatch[1]);
      if (index === -1) return send(res, 404, { errorMessage: 'customer not found' });
      db.customers[index] = { ...db.customers[index], ...body };
      writeDb(db);
      return send(res, 200, db.customers[index]);
    }

    if (customerMatch && req.method === 'DELETE') {
      if (PUBLIC_READ_ONLY) return send(res, 403, { errorMessage: 'Admin writes are disabled on this public endpoint' });
      const nextCustomers = db.customers.filter((customer) => customer.id !== customerMatch[1]);
      if (nextCustomers.length === db.customers.length) return send(res, 404, { errorMessage: 'customer not found' });
      db.customers = nextCustomers;
      writeDb(db);
      return send(res, 200, { deleted: customerMatch[1] });
    }

    return serveStatic(req, res, url);
  } catch (error) {
    return send(res, 500, { errorMessage: error.message });
  }
};

PORTS.forEach((port) => {
  const server = http.createServer(requestHandler);

  server.listen(port, '0.0.0.0', () => {
    console.log(`Support API listening on http://localhost:${port}/api/v1/support`);
  });

  server.on('error', (error) => {
    console.error(`Support API failed on port ${port}: ${error.message}`);
  });
});
