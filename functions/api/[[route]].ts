import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign, verify } from 'hono/jwt';

type Bindings = {
  DB: D1Database;
  APP_URL?: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// --- Helper Functions ---
async function hashPassword(password: string): Promise<string> {
  const myText = new TextEncoder().encode(password);
  const myDigest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    myText
  );
  const hashArray = Array.from(new Uint8Array(myDigest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'super-secret-default-key-for-jwt-justclub-2026';

// --- Auth Routes ---
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  const hashedPassword = await hashPassword(password);

  const user = await c.env.DB.prepare(`SELECT id, email, role, clubId FROM users WHERE email = ? AND passwordHash = ?`)
    .bind(email, hashedPassword).first();

  if (!user) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    clubId: user.clubId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
  };

  const token = await sign(payload, getJwtSecret(c));
  
  return c.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role, clubId: user.clubId }
  });
});

app.get('/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'No token' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, getJwtSecret(c));
    return c.json({ success: true, user: payload });
  } catch (err) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
});

// --- Middleware for Protected Routes ---
app.use('/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/login')) {
    return next();
  }
  
  // Verify token
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, getJwtSecret(c));
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
});

// --- Cashfree Config API ---
app.get('/cashfree/config', async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM cashfree_config ORDER BY id DESC LIMIT 1`).first();
  const config = result || {
    environment: 'TEST', testAppId: '', testSecretKey: '', liveAppId: '', liveSecretKey: '', isEnabled: 0, webhookSecret: ''
  };
  return c.json({ success: true, config: { ...config, isEnabled: Boolean(config.isEnabled) } });
});

app.post('/cashfree/config', async (c) => {
  const body = await c.req.json();
  await c.env.DB.prepare(`
    INSERT INTO cashfree_config (environment, testAppId, testSecretKey, liveAppId, liveSecretKey, isEnabled, webhookSecret, lastTestedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(body.environment, body.testAppId, body.testSecretKey, body.liveAppId, body.liveSecretKey, body.isEnabled ? 1 : 0, body.webhookSecret, new Date().toISOString()).run();
  return c.json({ success: true, message: 'Updated' });
});

// --- Data APIs (CRUD for Assets, Customers, Bar Items, Sessions) ---

app.get('/assets', async (c) => {
  const user = c.get('user') as any;
  const { results } = await c.env.DB.prepare(`SELECT * FROM game_assets WHERE clubId = ?`).bind(user.clubId).all();
  return c.json({ success: true, assets: results });
});

app.post('/assets', async (c) => {
  const user = c.get('user') as any;
  const asset = await c.req.json();
  const id = `ast_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO game_assets (id, clubId, name, category, hourlyRate, billingIncrement, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, user.clubId, asset.name, asset.category, asset.hourlyRate, asset.billingIncrement, asset.status || 'available').run();
  return c.json({ success: true, id });
});

app.get('/customers', async (c) => {
  const user = c.get('user') as any;
  const { results } = await c.env.DB.prepare(`SELECT * FROM customers WHERE clubId = ?`).bind(user.clubId).all();
  return c.json({ success: true, customers: results });
});

app.post('/customers', async (c) => {
  const user = c.get('user') as any;
  const customer = await c.req.json();
  const id = `cust_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO customers (id, clubId, name, whatsapp, ledgerBalance, totalVisits, lastVisitedDate, lifetimeValue, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, user.clubId, customer.name, customer.whatsapp, customer.ledgerBalance || 0, customer.totalVisits || 0, customer.lastVisitedDate || '', customer.lifetimeValue || 0, customer.notes || '').run();
  return c.json({ success: true, id });
});

app.get('/bar_items', async (c) => {
  const user = c.get('user') as any;
  const { results } = await c.env.DB.prepare(`SELECT * FROM bar_items WHERE clubId = ?`).bind(user.clubId).all();
  return c.json({ success: true, barItems: results });
});

app.get('/sessions', async (c) => {
  const user = c.get('user') as any;
  const { results } = await c.env.DB.prepare(`SELECT * FROM game_sessions WHERE clubId = ? AND status = 'running'`).bind(user.clubId).all();
  const sessions = results.map((r: any) => ({
    ...r,
    taggedPlayers: r.taggedPlayers ? JSON.parse(r.taggedPlayers) : [],
    attachedBarOrders: r.attachedBarOrders ? JSON.parse(r.attachedBarOrders) : []
  }));
  return c.json({ success: true, sessions });
});

app.post('/sessions', async (c) => {
  const user = c.get('user') as any;
  const session = await c.req.json();
  const id = `sess_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO game_sessions (id, clubId, assetId, assetName, category, hourlyRate, billingIncrement, matchType, taggedPlayers, startTime, pausedAt, totalPausedDuration, attachedBarOrders, status, endedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, user.clubId, session.assetId, session.assetName, session.category, session.hourlyRate, session.billingIncrement, 
    session.matchType, JSON.stringify(session.taggedPlayers || []), session.startTime, null, 0, JSON.stringify(session.attachedBarOrders || []), 'running', null
  ).run();
  
  await c.env.DB.prepare(`UPDATE game_assets SET status = 'occupied' WHERE id = ?`).bind(session.assetId).run();

  return c.json({ success: true, id });
});

app.post('/sessions/:id/end', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user') as any;
  const sessionData = await c.req.json(); // optionally pass total cost or update ledger here

  await c.env.DB.prepare(`UPDATE game_sessions SET status = 'ended', endedAt = ? WHERE id = ? AND clubId = ?`).bind(Date.now(), id, user.clubId).run();
  const session = await c.env.DB.prepare(`SELECT assetId FROM game_sessions WHERE id = ?`).bind(id).first();
  if (session && session.assetId) {
    await c.env.DB.prepare(`UPDATE game_assets SET status = 'available' WHERE id = ?`).bind(session.assetId).run();
  }
  return c.json({ success: true });
});

export const onRequest = handle(app);
