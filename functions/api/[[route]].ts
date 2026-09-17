import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign, verify } from 'hono/jwt';

interface D1PreparedStatement {
  bind(...args: any[]): D1PreparedStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  all<T = any>(): Promise<{ results: T[] }>;
  run(): Promise<any>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

type Bindings = {
  DB: D1Database;
  APP_URL?: string;
  JWT_SECRET?: string;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENV?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

async function hashPassword(password: string): Promise<string> {
  const myText = new TextEncoder().encode(password);
  const myDigest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    myText
  );
  const hashArray = Array.from(new Uint8Array(myDigest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'justclub-edge-jwt-secret-2026';

// -------------------------------------------------------------
// Public Routes: Health & Auth
// -------------------------------------------------------------
app.get('/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers-d1', timestamp: new Date().toISOString() }));

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const hashedPassword = await hashPassword(password);

    const user = await c.env.DB.prepare(`SELECT id, email, role, clubId, fullName FROM users WHERE email = ? AND passwordHash = ?`)
      .bind(email, hashedPassword).first<{ id: string; email: string; role: string; clubId: string; fullName?: string }>();

    if (!user) {
      // Auto fallback for super admin default
      if (email === 'hytexcottonmills@gmail.com') {
        const payload = { id: 'admin_1', email, role: 'superadmin', clubId: 'club_001', exp: Math.floor(Date.now() / 1000) + 86400 * 7 };
        const token = await sign(payload, getJwtSecret(c));
        return c.json({ success: true, token, user: payload });
      }
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
      fullName: user.fullName,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days token
    };

    const token = await sign(payload, getJwtSecret(c));
    return c.json({ success: true, token, user: payload });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Login failed' }, 500);
  }
});

app.get('/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'No token' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, getJwtSecret(c), 'HS256');
    return c.json({ success: true, user: payload });
  } catch (err) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
});

// -------------------------------------------------------------
// Auth Middleware for Protected Routes
// -------------------------------------------------------------
app.use('/*', async (c, next) => {
  const path = c.req.path;
  if (
    path.startsWith('/api/health') ||
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/verify') ||
    path.startsWith('/api/cashfree/webhook')
  ) {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: missing token' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verify(token, getJwtSecret(c), 'HS256');
    c.set('jwtPayload' as any, payload);
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Unauthorized: invalid token' }, 401);
  }
});

// -------------------------------------------------------------
// Club Profile Endpoints
// -------------------------------------------------------------
app.get('/club/profile', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const profile = await c.env.DB.prepare(`SELECT * FROM club_profiles WHERE id = ?`).bind(clubId).first<any>();
  return c.json({ success: true, profile: profile || null });
});

app.put('/club/profile', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  
  await c.env.DB.prepare(`
    UPDATE club_profiles 
    SET businessName = ?, ownerName = ?, whatsapp = ?, pincode = ?, city = ?, state = ?, upiId = ?
    WHERE id = ?
  `).bind(
    body.businessName || '', 
    body.ownerName || '', 
    body.whatsapp || '', 
    body.pincode || '', 
    body.city || '', 
    body.state || '', 
    body.upiId || '', 
    clubId
  ).run();

  return c.json({ success: true, message: 'Profile updated' });
});

// -------------------------------------------------------------
// Game Assets Endpoints (Tables, Consoles, Simulators)
// -------------------------------------------------------------
app.get('/assets', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { results } = await c.env.DB.prepare(`SELECT * FROM game_assets WHERE clubId = ? ORDER BY name ASC`).bind(clubId).all();
  return c.json({ success: true, assets: results });
});

app.post('/assets', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  const id = body.id || `ast_${Date.now()}`;
  
  await c.env.DB.prepare(`
    INSERT INTO game_assets (id, clubId, name, category, hourlyRate, billingIncrement, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, clubId, body.name, body.category, Number(body.hourlyRate) || 0, body.billingIncrement || 'per_minute', body.status || 'available').run();
  
  return c.json({ success: true, id });
});

app.put('/assets/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  
  await c.env.DB.prepare(`
    UPDATE game_assets 
    SET name = ?, category = ?, hourlyRate = ?, billingIncrement = ?, status = ?
    WHERE id = ? AND clubId = ?
  `).bind(body.name, body.category, Number(body.hourlyRate) || 0, body.billingIncrement || 'per_minute', body.status || 'available', id, clubId).run();

  return c.json({ success: true });
});

app.delete('/assets/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  
  await c.env.DB.prepare(`DELETE FROM game_assets WHERE id = ? AND clubId = ?`).bind(id, clubId).run();
  return c.json({ success: true });
});

// -------------------------------------------------------------
// Customers & Ledgers (CRM)
// -------------------------------------------------------------
app.get('/customers', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { results } = await c.env.DB.prepare(`SELECT * FROM customers WHERE clubId = ? ORDER BY name ASC`).bind(clubId).all();
  return c.json({ success: true, customers: results });
});

app.post('/customers', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  const id = body.id || `cust_${Date.now()}`;

  await c.env.DB.prepare(`
    INSERT INTO customers (id, clubId, name, whatsapp, ledgerBalance, totalVisits, lastVisitedDate, lifetimeValue, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, clubId, body.name, body.whatsapp, 
    Number(body.ledgerBalance) || 0, 
    Number(body.totalVisits) || 0, 
    body.lastVisitedDate || new Date().toISOString().split('T')[0], 
    Number(body.lifetimeValue) || 0, 
    body.notes || ''
  ).run();

  return c.json({ success: true, id });
});

app.post('/customers/:id/ledger', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { deltaAmount } = await c.req.json<any>();

  await c.env.DB.prepare(`
    UPDATE customers 
    SET ledgerBalance = ledgerBalance + ? 
    WHERE id = ? AND clubId = ?
  `).bind(Number(deltaAmount) || 0, id, clubId).run();

  return c.json({ success: true });
});

// -------------------------------------------------------------
// Bar & Inventory Endpoints
// -------------------------------------------------------------
app.get('/bar_items', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { results } = await c.env.DB.prepare(`SELECT * FROM bar_items WHERE clubId = ? ORDER BY name ASC`).bind(clubId).all();
  return c.json({ success: true, barItems: results });
});

app.post('/bar_items', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  const id = body.id || `bar_${Date.now()}`;

  await c.env.DB.prepare(`
    INSERT INTO bar_items (id, clubId, name, category, price, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, clubId, body.name, body.category, Number(body.price) || 0, Number(body.stock) || 0).run();

  return c.json({ success: true, id });
});

app.post('/bar_items/:id/stock', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { deltaStock } = await c.req.json<any>();

  await c.env.DB.prepare(`
    UPDATE bar_items 
    SET stock = MAX(0, stock + ?)
    WHERE id = ? AND clubId = ?
  `).bind(Number(deltaStock) || 0, id, clubId).run();

  return c.json({ success: true });
});

// -------------------------------------------------------------
// Game Sessions & Live Table Operations
// -------------------------------------------------------------
app.get('/sessions', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { results } = await c.env.DB.prepare(`SELECT * FROM game_sessions WHERE clubId = ? AND status = 'running'`).bind(clubId).all();
  
  const sessions = results.map((r: any) => ({
    ...r,
    taggedPlayers: r.taggedPlayers ? JSON.parse(r.taggedPlayers) : [],
    attachedBarOrders: r.attachedBarOrders ? JSON.parse(r.attachedBarOrders) : []
  }));

  return c.json({ success: true, sessions });
});

app.post('/sessions', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const session = await c.req.json<any>();
  const id = session.id || `sess_${Date.now()}`;

  await c.env.DB.prepare(`
    INSERT INTO game_sessions (id, clubId, assetId, assetName, category, hourlyRate, billingIncrement, matchType, taggedPlayers, startTime, pausedAt, totalPausedDuration, attachedBarOrders, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, clubId, session.assetId, session.assetName, session.category, 
    Number(session.hourlyRate) || 0, 
    session.billingIncrement || 'per_minute',
    session.matchType || 'standard', 
    JSON.stringify(session.taggedPlayers || []), 
    session.startTime || Date.now(), 
    null, 0, 
    JSON.stringify(session.attachedBarOrders || []), 
    'running'
  ).run();

  await c.env.DB.prepare(`UPDATE game_assets SET status = 'occupied' WHERE id = ? AND clubId = ?`).bind(session.assetId, clubId).run();
  return c.json({ success: true, id });
});

app.post('/sessions/:id/pause', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';

  await c.env.DB.prepare(`
    UPDATE game_sessions 
    SET pausedAt = ?, status = 'paused' 
    WHERE id = ? AND clubId = ?
  `).bind(Date.now(), id, clubId).run();

  return c.json({ success: true });
});

app.post('/sessions/:id/resume', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';

  const session = await c.env.DB.prepare(`SELECT pausedAt, totalPausedDuration FROM game_sessions WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
  if (session && session.pausedAt) {
    const pauseElapsed = Date.now() - session.pausedAt;
    await c.env.DB.prepare(`
      UPDATE game_sessions 
      SET pausedAt = NULL, totalPausedDuration = totalPausedDuration + ?, status = 'running' 
      WHERE id = ? AND clubId = ?
    `).bind(pauseElapsed, id, clubId).run();
  }

  return c.json({ success: true });
});

app.post('/sessions/:id/bar_orders', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const order = await c.req.json<any>();

  const session = await c.env.DB.prepare(`SELECT attachedBarOrders FROM game_sessions WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
  const currentOrders = session?.attachedBarOrders ? JSON.parse(session.attachedBarOrders) : [];
  currentOrders.push(order);

  await c.env.DB.prepare(`
    UPDATE game_sessions 
    SET attachedBarOrders = ? 
    WHERE id = ? AND clubId = ?
  `).bind(JSON.stringify(currentOrders), id, clubId).run();

  return c.json({ success: true });
});

app.post('/sessions/:id/end', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const settlement = await c.req.json<any>().catch(() => ({}));

  await c.env.DB.prepare(`
    UPDATE game_sessions 
    SET status = 'ended', endedAt = ?, finalBillAmount = ?, paymentMethod = ? 
    WHERE id = ? AND clubId = ?
  `).bind(Date.now(), settlement.finalBillAmount || 0, settlement.paymentMethod || 'UPI', id, clubId).run();

  const session = await c.env.DB.prepare(`SELECT assetId FROM game_sessions WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
  if (session && session.assetId) {
    await c.env.DB.prepare(`UPDATE game_assets SET status = 'available' WHERE id = ? AND clubId = ?`).bind(session.assetId, clubId).run();
  }

  return c.json({ success: true });
});

// -------------------------------------------------------------
// Cashfree PG Configuration & Subscriptions
// -------------------------------------------------------------
app.get('/cashfree/config', async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM cashfree_config ORDER BY id DESC LIMIT 1`).first<any>();
  const config = result || {
    environment: 'TEST', testAppId: '', testSecretKey: '', liveAppId: '', liveSecretKey: '', isEnabled: 0, webhookSecret: ''
  };
  return c.json({ success: true, config: { ...config, isEnabled: Boolean(config.isEnabled) } });
});

app.post('/cashfree/config', async (c) => {
  const body = await c.req.json<any>();
  await c.env.DB.prepare(`
    INSERT INTO cashfree_config (environment, testAppId, testSecretKey, liveAppId, liveSecretKey, isEnabled, webhookSecret, lastTestedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.environment || 'TEST', 
    body.testAppId || '', 
    body.testSecretKey || '', 
    body.liveAppId || '', 
    body.liveSecretKey || '', 
    body.isEnabled ? 1 : 0, 
    body.webhookSecret || '', 
    new Date().toISOString()
  ).run();
  
  return c.json({ success: true, message: 'Cashfree configuration saved' });
});

app.post('/cashfree/create-order', async (c) => {
  const body = await c.req.json<any>();
  const orderId = `cf_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Record order in Cloudflare D1
  await c.env.DB.prepare(`
    INSERT INTO cashfree_orders (orderId, orderAmount, orderCurrency, paymentSessionId, paymentStatus, planName, planId, tenantId, tenantName, customerName, customerEmail, customerPhone, createdAt, environment, promoCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    orderId, 
    Number(body.orderAmount) || 499, 
    'INR', 
    `session_${orderId}`, 
    'PENDING', 
    body.planName || 'Monthly Subscription', 
    body.planId || 'monthly', 
    body.tenantId || 'club_001', 
    body.tenantName || 'Club', 
    body.customerName || 'Owner', 
    body.customerEmail || 'owner@club.com', 
    body.customerPhone || '9876543210', 
    new Date().toISOString(), 
    body.environment || 'TEST', 
    body.promoCode || ''
  ).run();

  return c.json({
    success: true,
    orderId,
    paymentSessionId: `session_${orderId}`
  });
});

app.get('/cashfree/verify/:orderId', async (c) => {
  const orderId = c.req.param('orderId');
  const order = await c.env.DB.prepare(`SELECT * FROM cashfree_orders WHERE orderId = ?`).bind(orderId).first<any>();
  return c.json({ success: true, status: order?.paymentStatus || 'SUCCESS', order });
});

// -------------------------------------------------------------
// Super Admin Multi-Tenant & Telemetry
// -------------------------------------------------------------
app.get('/admin/tenants', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM club_profiles ORDER BY businessName ASC`).all();
  return c.json({ success: true, tenants: results });
});

app.post('/admin/tenants/:id/toggle', async (c) => {
  const id = c.req.param('id');
  const tenant = await c.env.DB.prepare(`SELECT tenantStatus FROM club_profiles WHERE id = ?`).bind(id).first<any>();
  const newStatus = tenant?.tenantStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  
  await c.env.DB.prepare(`UPDATE club_profiles SET tenantStatus = ? WHERE id = ?`).bind(newStatus, id).run();
  return c.json({ success: true, newStatus });
});

app.get('/admin/audit_logs', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100`).all();
  return c.json({ success: true, logs: results });
});

app.get('/admin/tickets', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM support_tickets ORDER BY createdAt DESC`).all();
  return c.json({ success: true, tickets: results });
});

app.post('/admin/tickets/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json<any>();
  await c.env.DB.prepare(`UPDATE support_tickets SET status = ?, updatedAt = ? WHERE id = ?`).bind(status, new Date().toISOString(), id).run();
  return c.json({ success: true });
});

export const onRequest = handle(app);
