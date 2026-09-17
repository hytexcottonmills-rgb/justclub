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
  GOOGLE_CLIENT_ID?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

function generateSalt(): string {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  return Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2Hash(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedKey));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function legacySha256Hash(password: string): Promise<string> {
  const myText = new TextEncoder().encode(password);
  const myDigest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    myText
  );
  const hashArray = Array.from(new Uint8Array(myDigest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifyCashfreeSignature(
  timestamp: string | null,
  rawBody: string,
  signature: string,
  secretKey: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const convertToBase64 = (buffer: ArrayBuffer) => {
      const array = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < array.byteLength; i++) {
        binary += String.fromCharCode(array[i]);
      }
      return btoa(binary);
    };

    const convertToHex = (buffer: ArrayBuffer) => {
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    };

    // Option A: timestamp + rawBody (standard Cashfree webhook signature)
    if (timestamp) {
      const dataStringA = timestamp + rawBody;
      const messageDataA = encoder.encode(dataStringA);
      const hmacBufferA = await crypto.subtle.sign('HMAC', cryptoKey, messageDataA);
      if (timingSafeEqual(convertToBase64(hmacBufferA), signature) || timingSafeEqual(convertToHex(hmacBufferA), signature)) {
        return true;
      }
    }

    // Option B: rawBody only
    const messageDataB = encoder.encode(rawBody);
    const hmacBufferB = await crypto.subtle.sign('HMAC', cryptoKey, messageDataB);
    if (timingSafeEqual(convertToBase64(hmacBufferB), signature) || timingSafeEqual(convertToHex(hmacBufferB), signature)) {
      return true;
    }
  } catch (err) {
    console.error('Error during signature verification:', err);
  }

  return false;
}

const getJwtSecret = (c: any) => {
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing. Authentication has failed closed.');
  }
  return secret;
};

// -------------------------------------------------------------
// Public Routes: Health & Auth
// -------------------------------------------------------------
app.get('/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers-d1', timestamp: new Date().toISOString() }));

app.post('/auth/bootstrap-admin', async (c) => {
  try {
    const { count } = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM users`).first<{ count: number }>() || { count: 0 };
    if (count > 0) {
      return c.json({ success: false, error: 'Bootstrap endpoint is disabled since users already exist' }, 403);
    }

    const { email, password, fullName } = await c.req.json<{ email?: string; password?: string; fullName?: string }>();
    if (!email || !password || !fullName) {
      return c.json({ success: false, error: 'email, password, and fullName are required' }, 400);
    }

    const id = `usr_admin_${Date.now()}`;
    const salt = generateSalt();
    const passwordHash = await pbkdf2Hash(password, salt);
    const role = 'superadmin';
    const clubId = 'club_001';

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, passwordHash, salt, role, clubId, fullName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, email, passwordHash, salt, role, clubId, fullName).run();

    // Create corresponding club profile for the admin if not exists
    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, email, tenantStatus)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `).bind(clubId, 'Hytex Cotton Mills Club', fullName, email).run();

    return c.json({ success: true, message: 'Superadmin user bootstrapped successfully', userId: id });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Bootstrap failed' }, 500);
  }
});

const loginAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(email: string): { allowed: boolean; remainingSec?: number } {
  const normEmail = email.toLowerCase().trim();
  const record = loginAttemptsMap.get(normEmail);
  if (!record) return { allowed: true };
  if (record.lockedUntil > Date.now()) {
    const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return { allowed: false, remainingSec };
  }
  return { allowed: true };
}

function recordFailedLogin(email: string) {
  const normEmail = email.toLowerCase().trim();
  const record = loginAttemptsMap.get(normEmail) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 5 * 60 * 1000; // 5 minute lockout
    record.count = 0;
  }
  loginAttemptsMap.set(normEmail, record);
}

function recordSuccessfulLogin(email: string) {
  const normEmail = email.toLowerCase().trim();
  loginAttemptsMap.delete(normEmail);
}

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return c.json({ 
        success: false, 
        error: `Too many failed login attempts. Account temporarily locked for ${rateCheck.remainingSec} seconds.` 
      }, 429);
    }

    const user = await c.env.DB.prepare(`SELECT id, email, passwordHash, salt, role, clubId, fullName FROM users WHERE email = ?`)
      .bind(email).first<{ id: string; email: string; passwordHash: string; salt: string | null; role: string; clubId: string; fullName?: string }>();

    if (!user) {
      recordFailedLogin(email);
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    let isMatch = false;
    if (user.salt) {
      const computedHash = await pbkdf2Hash(password, user.salt);
      isMatch = computedHash === user.passwordHash;
    } else {
      const computedHash = await legacySha256Hash(password);
      isMatch = computedHash === user.passwordHash;
    }

    if (!isMatch) {
      recordFailedLogin(email);
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    recordSuccessfulLogin(email);

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

app.post('/auth/google', async (c) => {
  try {
    const { credential } = await c.req.json();
    if (!credential) {
      return c.json({ success: false, error: 'Credential token is required' }, 400);
    }

    // Call Google tokeninfo API to verify Google JWT authenticity server-side
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyRes.ok) {
      return c.json({ success: false, error: 'Google authentication failed' }, 401);
    }

    const googlePayload = await verifyRes.json() as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      aud: string;
    };

    const expectedAudience = c.env.GOOGLE_CLIENT_ID;
    if (!expectedAudience || googlePayload.aud !== expectedAudience) {
      return c.json({ success: false, error: 'Invalid token audience' }, 401);
    }

    const email = googlePayload.email;
    const fullName = googlePayload.name || email.split('@')[0];

    // Look up or auto-register user on real login
    let user = await c.env.DB.prepare(`SELECT id, email, role, clubId, fullName FROM users WHERE email = ?`)
      .bind(email).first<{ id: string; email: string; role: string; clubId: string; fullName?: string }>();

    if (!user) {
      const newUserId = `usr_google_${googlePayload.sub}`;
      const defaultClubId = `club_${Date.now()}`;
      const role = 'club_owner';

      await c.env.DB.prepare(`
        INSERT INTO users (id, email, passwordHash, salt, role, clubId, fullName)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(newUserId, email, 'google_authenticated_external', 'google', role, defaultClubId, fullName).run();

      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, email, tenantStatus)
        VALUES (?, ?, ?, ?, 'ACTIVE')
      `).bind(defaultClubId, `${fullName}'s Club`, fullName, email).run();

      user = {
        id: newUserId,
        email,
        role,
        clubId: defaultClubId,
        fullName
      };
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
    return c.json({ success: false, error: err.message || 'Google login failed' }, 500);
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
    path.startsWith('/api/auth/bootstrap-admin') ||
    path.startsWith('/api/auth/google') ||
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
// Super Admin Role Enforcement Middleware
// -------------------------------------------------------------
const requireSuperAdmin = async (c: any, next: any) => {
  const user = c.get('jwtPayload' as any) as any;
  if (!user || user.role !== 'superadmin') {
    return c.json({ success: false, error: 'Forbidden: superadmin access required' }, 403);
  }
  await next();
};

app.use('/admin/*', requireSuperAdmin);
app.use('/cashfree/config', requireSuperAdmin);

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

app.put('/bar_items/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();

  await c.env.DB.prepare(`
    UPDATE bar_items 
    SET name = ?, category = ?, price = ?, stock = ?
    WHERE id = ? AND clubId = ?
  `).bind(body.name, body.category, Number(body.price) || 0, Number(body.stock) || 0, id, clubId).run();

  return c.json({ success: true });
});

app.delete('/bar_items/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';

  await c.env.DB.prepare(`DELETE FROM bar_items WHERE id = ? AND clubId = ?`).bind(id, clubId).run();

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
app.get('/cashfree/config', requireSuperAdmin, async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM cashfree_config ORDER BY id DESC LIMIT 1`).first<any>();
  const config = result || {};
  return c.json({ 
    success: true, 
    config: { 
      environment: config.environment || 'TEST',
      testAppId: config.testAppId || '',
      liveAppId: config.liveAppId || '',
      isEnabled: Boolean(config.isEnabled),
      hasTestSecretKey: Boolean(config.testSecretKey && config.testSecretKey.trim().length > 0),
      hasLiveSecretKey: Boolean(config.liveSecretKey && config.liveSecretKey.trim().length > 0),
      hasWebhookSecret: Boolean(config.webhookSecret && config.webhookSecret.trim().length > 0),
    } 
  });
});

app.post('/cashfree/config', requireSuperAdmin, async (c) => {
  const body = await c.req.json<any>();
  const existingConfig = await c.env.DB.prepare(`SELECT * FROM cashfree_config ORDER BY id DESC LIMIT 1`).first<any>();

  const testSecretKey = (body.testSecretKey && body.testSecretKey.trim()) 
    ? body.testSecretKey 
    : (existingConfig?.testSecretKey || '');
  const liveSecretKey = (body.liveSecretKey && body.liveSecretKey.trim()) 
    ? body.liveSecretKey 
    : (existingConfig?.liveSecretKey || '');
  const webhookSecret = (body.webhookSecret && body.webhookSecret.trim()) 
    ? body.webhookSecret 
    : (existingConfig?.webhookSecret || '');

  await c.env.DB.prepare(`
    INSERT INTO cashfree_config (environment, testAppId, testSecretKey, liveAppId, liveSecretKey, isEnabled, webhookSecret, lastTestedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.environment || 'TEST', 
    body.testAppId || '', 
    testSecretKey, 
    body.liveAppId || '', 
    liveSecretKey, 
    body.isEnabled ? 1 : 0, 
    webhookSecret, 
    new Date().toISOString()
  ).run();

  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';

  // Create Audit Log
  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'CASHFREE_CONFIG_UPDATED',
    adminEmail,
    'SYSTEM',
    'JustClub Platform',
    'warning',
    JSON.stringify({ environment: body.environment || 'TEST', isEnabled: body.isEnabled ? 1 : 0 }),
    timestamp
  ).run();
  
  return c.json({ success: true, message: 'Cashfree configuration saved' });
});

app.post('/cashfree/create-order', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const body = await c.req.json<any>();
  const orderId = `cf_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const tenantId = user?.clubId || body.tenantId || 'club_001';
  const orderAmount = Number(body.amount || body.orderAmount) || 499;

  // Record order in Cloudflare D1
  await c.env.DB.prepare(`
    INSERT INTO cashfree_orders (orderId, orderAmount, orderCurrency, paymentSessionId, paymentStatus, planName, planId, tenantId, tenantName, customerName, customerEmail, customerPhone, createdAt, environment, promoCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    orderId, 
    orderAmount, 
    'INR', 
    `session_${orderId}`, 
    'PENDING', 
    body.planName || 'Monthly Subscription', 
    body.planId || 'monthly', 
    tenantId, 
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

app.post('/cashfree/verify-order', async (c) => {
  try {
    const { orderId } = await c.req.json<any>();
    if (!orderId) {
      return c.json({ success: false, error: 'orderId is required' }, 400);
    }
    
    // Retrieve original order payload from D1 database
    const order = await c.env.DB.prepare(`SELECT * FROM cashfree_orders WHERE orderId = ?`).bind(orderId).first<any>();
    if (!order) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }

    const config = await c.env.DB.prepare(`SELECT * FROM cashfree_config ORDER BY id DESC LIMIT 1`).first<any>();
    const environment = config?.environment || 'TEST';
    const appId = environment === 'PRODUCTION' ? config?.liveAppId : config?.testAppId;
    const secretKey = environment === 'PRODUCTION' ? config?.liveSecretKey : config?.testSecretKey;

    const finalAppId = appId || c.env.CASHFREE_APP_ID;
    const finalSecretKey = secretKey || c.env.CASHFREE_SECRET_KEY;
    const finalEnv = environment || c.env.CASHFREE_ENV || 'TEST';

    const baseUrl = finalEnv === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    if (!finalAppId || !finalSecretKey) {
      return c.json({ success: false, error: 'Payment gateway is not configured' }, 400);
    }

    let verifiedPaid = false;
    let cfPaymentId = `cf_pay_sim_${Date.now()}`;
    let paymentMethod = 'UPI';

    // Hit real Cashfree Verification API
    const response = await fetch(`${baseUrl}/${orderId}`, {
      headers: {
        'x-client-id': finalAppId,
        'x-client-secret': finalSecretKey,
        'x-api-version': '2023-08-01'
      }
    });

    if (response.ok) {
      const cfOrder = await response.json() as any;
      if (cfOrder.order_status === 'PAID') {
        verifiedPaid = true;
        cfPaymentId = cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : cfPaymentId;
        paymentMethod = cfOrder.order_gateway_details?.gateway_name || 'UPI';
      }
    }

    if (!verifiedPaid) {
      return c.json({ success: false, error: 'Payment could not be verified with Cashfree' }, 400);
    }

    // Set paymentStatus to SUCCESS, and save gateway details securely
    await c.env.DB.prepare(`
      UPDATE cashfree_orders 
      SET paymentStatus = 'SUCCESS', cfPaymentId = ?, paymentMethod = ?, paidAt = ?
      WHERE orderId = ?
    `).bind(
      cfPaymentId,
      paymentMethod,
      new Date().toISOString(),
      orderId
    ).run();

    // Dynamically extend due date (monthly: +1 mo, quarterly: +3 mo, yearly: +12 mo)
    const renewedDate = new Date();
    let monthsToAdd = 1;
    if (order.planId === 'quarterly') monthsToAdd = 3;
    if (order.planId === 'yearly') monthsToAdd = 12;
    renewedDate.setMonth(renewedDate.getMonth() + monthsToAdd);

    // Promote matching club tenant's profile to ACTIVE
    await c.env.DB.prepare(`
      UPDATE club_profiles 
      SET tenantStatus = 'ACTIVE', renewalDueDate = ?
      WHERE id = ?
    `).bind(renewedDate.toISOString().split('T')[0], order.tenantId).run();

    const updatedOrder = await c.env.DB.prepare(`SELECT * FROM cashfree_orders WHERE orderId = ?`).bind(orderId).first<any>();

    return c.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Payment verification failed' }, 500);
  }
});

app.post('/cashfree/webhook', async (c) => {
  try {
    const config = await c.env.DB.prepare(`SELECT * FROM cashfree_config ORDER BY id DESC LIMIT 1`).first<any>();
    const webhookSecret = config?.webhookSecret;

    const signature = c.req.header('x-webhook-signature');
    const timestamp = c.req.header('x-webhook-timestamp') || null;

    if (!webhookSecret || !signature) {
      return c.json({ success: false, error: 'Unauthorized: missing signature or webhook secret' }, 401);
    }

    const rawBody = await c.req.text();
    const isSignatureValid = await verifyCashfreeSignature(timestamp, rawBody, signature, webhookSecret);
    if (!isSignatureValid) {
      return c.json({ success: false, error: 'Unauthorized: invalid signature' }, 401);
    }

    const body = JSON.parse(rawBody);
    const orderId = body?.data?.order?.order_id || body?.order?.order_id || body?.orderId;

    if (!orderId) {
      return c.json({ success: false, error: 'orderId not found in webhook' }, 400);
    }

    // Process the exact same verification logic as verify-order
    const order = await c.env.DB.prepare(`SELECT * FROM cashfree_orders WHERE orderId = ?`).bind(orderId).first<any>();
    if (!order) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }

    const environment = config?.environment || 'TEST';
    const appId = environment === 'PRODUCTION' ? config?.liveAppId : config?.testAppId;
    const secretKey = environment === 'PRODUCTION' ? config?.liveSecretKey : config?.testSecretKey;

    const finalAppId = appId || c.env.CASHFREE_APP_ID;
    const finalSecretKey = secretKey || c.env.CASHFREE_SECRET_KEY;
    const finalEnv = environment || c.env.CASHFREE_ENV || 'TEST';

    const baseUrl = finalEnv === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    if (!finalAppId || !finalSecretKey) {
      return c.json({ success: false, error: 'Payment gateway is not configured' }, 400);
    }

    let verifiedPaid = false;
    let cfPaymentId = `cf_pay_sim_${Date.now()}`;
    let paymentMethod = 'UPI';

    const response = await fetch(`${baseUrl}/${orderId}`, {
      headers: {
        'x-client-id': finalAppId,
        'x-client-secret': finalSecretKey,
        'x-api-version': '2023-08-01'
      }
    });
    if (response.ok) {
      const cfOrder = await response.json() as any;
      if (cfOrder.order_status === 'PAID') {
        verifiedPaid = true;
        cfPaymentId = cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : cfPaymentId;
        paymentMethod = cfOrder.order_gateway_details?.gateway_name || 'UPI';
      }
    }

    if (!verifiedPaid) {
      return c.json({ success: false, error: 'Payment could not be verified' }, 400);
    }

    // Update D1
    await c.env.DB.prepare(`
      UPDATE cashfree_orders 
      SET paymentStatus = 'SUCCESS', cfPaymentId = ?, paymentMethod = ?, paidAt = ?
      WHERE orderId = ?
    `).bind(cfPaymentId, paymentMethod, new Date().toISOString(), orderId).run();

    // Extend due date
    const renewedDate = new Date();
    let monthsToAdd = 1;
    if (order.planId === 'quarterly') monthsToAdd = 3;
    if (order.planId === 'yearly') monthsToAdd = 12;
    renewedDate.setMonth(renewedDate.getMonth() + monthsToAdd);

    await c.env.DB.prepare(`
      UPDATE club_profiles 
      SET tenantStatus = 'ACTIVE', renewalDueDate = ?
      WHERE id = ?
    `).bind(renewedDate.toISOString().split('T')[0], order.tenantId).run();

    return c.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Webhook verification failed' }, 500);
  }
});

// -------------------------------------------------------------
// Support Desk Ticket Creation
// -------------------------------------------------------------
app.post('/support/tickets', async (c) => {
  try {
    const user = c.get('jwtPayload' as any) as any;
    const clubId = user?.clubId || 'club_001';
    const { subject, category, priority, description } = await c.req.json<any>();

    if (!subject || !category || !description) {
      return c.json({ success: false, error: 'subject, category, and description are required' }, 400);
    }

    const ticketId = `tkt_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const club = await c.env.DB.prepare(`SELECT businessName FROM club_profiles WHERE id = ?`).bind(clubId).first<{ businessName: string }>();
    const clubName = club?.businessName || 'Unknown Club';

    await c.env.DB.prepare(`
      INSERT INTO support_tickets (id, clubId, clubName, subject, category, priority, status, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
    `).bind(ticketId, clubId, clubName, subject, category, priority || 'MEDIUM', description, createdAt).run();

    return c.json({ success: true, id: ticketId });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to create support ticket' }, 500);
  }
});

// -------------------------------------------------------------
// Super Admin Multi-Tenant & Telemetry
// -------------------------------------------------------------
app.get('/admin/tenants', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM club_profiles ORDER BY businessName ASC`).all();
  return c.json({ success: true, tenants: results });
});

app.post('/admin/tenants/:id/toggle', requireSuperAdmin, async (c) => {
  const id = c.req.param('id');
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';

  const tenant = await c.env.DB.prepare(`SELECT tenantStatus, businessName FROM club_profiles WHERE id = ?`).bind(id).first<any>();
  if (!tenant) {
    return c.json({ success: false, error: 'Tenant not found' }, 404);
  }
  const newStatus = tenant.tenantStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  
  await c.env.DB.prepare(`UPDATE club_profiles SET tenantStatus = ? WHERE id = ?`).bind(newStatus, id).run();

  // Create Audit Log
  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    `Toggle Tenant Status to ${newStatus}`,
    adminEmail,
    id,
    tenant.businessName,
    newStatus === 'ACTIVE' ? 'success' : 'danger',
    JSON.stringify({ tenantId: id, status: newStatus }),
    timestamp
  ).run();

  return c.json({ success: true, newStatus });
});

app.get('/admin/audit_logs', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100`).all();
  return c.json({ success: true, logs: results });
});

app.get('/admin/tickets', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM support_tickets ORDER BY createdAt DESC`).all();
  return c.json({ success: true, tickets: results });
});

app.post('/admin/tickets/:id/status', requireSuperAdmin, async (c) => {
  const id = c.req.param('id');
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';

  const { status } = await c.req.json<any>();
  await c.env.DB.prepare(`UPDATE support_tickets SET status = ?, updatedAt = ? WHERE id = ?`).bind(status, new Date().toISOString(), id).run();

  // Create Audit Log
  const ticket = await c.env.DB.prepare(`SELECT clubId, clubName, subject FROM support_tickets WHERE id = ?`).bind(id).first<any>();
  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    `Update Ticket Status to ${status}`,
    adminEmail,
    ticket?.clubId || 'Unknown',
    ticket?.clubName || 'Unknown',
    'info',
    JSON.stringify({ ticketId: id, status, subject: ticket?.subject }),
    timestamp
  ).run();

  return c.json({ success: true });
});

export const onRequest = handle(app);
