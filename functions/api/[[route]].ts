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
  batch<T = any>(statements: D1PreparedStatement[]): Promise<{ results: T[] }[]>;
}

type Bindings = {
  DB: D1Database;
  APP_URL?: string;
  ALLOWED_ORIGINS?: string;
  JWT_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// Global Anti-Caching & Baseline Security Headers Middleware
app.use('/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
});

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

    if (timestamp) {
      const dataStringA = timestamp + rawBody;
      const messageDataA = encoder.encode(dataStringA);
      const hmacBufferA = await crypto.subtle.sign('HMAC', cryptoKey, messageDataA);
      if (timingSafeEqual(convertToBase64(hmacBufferA), signature) || timingSafeEqual(convertToHex(hmacBufferA), signature)) {
        return true;
      }
    }

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

    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, email, tenantStatus)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `).bind(clubId, 'Hytex Cotton Mills Club', fullName, email).run();

    return c.json({ success: true, message: 'Superadmin user bootstrapped successfully', userId: id });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Bootstrap failed' }, 500);
  }
});

// Persistent D1 Rate Limiting Helpers
async function checkRateLimit(db: D1Database, email: string): Promise<{ allowed: boolean; remainingSec?: number }> {
  const normEmail = email.toLowerCase().trim();
  const row = await db.prepare(`SELECT failCount, lockedUntil FROM login_attempts WHERE email = ?`).bind(normEmail).first<{ failCount: number; lockedUntil: string | null }>();
  if (!row) return { allowed: true };
  if (row.lockedUntil) {
    const lockTime = new Date(row.lockedUntil).getTime();
    if (lockTime > Date.now()) {
      const remainingSec = Math.ceil((lockTime - Date.now()) / 1000);
      return { allowed: false, remainingSec };
    }
  }
  return { allowed: true };
}

async function recordFailedLogin(db: D1Database, email: string) {
  const normEmail = email.toLowerCase().trim();
  const row = await db.prepare(`SELECT failCount, lockedUntil FROM login_attempts WHERE email = ?`).bind(normEmail).first<{ failCount: number; lockedUntil: string | null }>();
  const failCount = (row?.failCount || 0) + 1;
  let lockedUntil: string | null = row?.lockedUntil || null;
  if (failCount >= 5) {
    lockedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  }
  await db.prepare(`
    INSERT INTO login_attempts (email, failCount, lockedUntil, updatedAt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET failCount = ?, lockedUntil = ?, updatedAt = ?
  `).bind(normEmail, failCount, lockedUntil, new Date().toISOString(), failCount, lockedUntil, new Date().toISOString()).run();
}

async function recordSuccessfulLogin(db: D1Database, email: string) {
  const normEmail = email.toLowerCase().trim();
  await db.prepare(`DELETE FROM login_attempts WHERE email = ?`).bind(normEmail).run();
}

// ACTION REQUIRED: Configure Cloudflare WAF Rate Limiting for this endpoint to prevent brute-force attacks.
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    const rateCheck = await checkRateLimit(c.env.DB, email);
    if (!rateCheck.allowed) {
      return c.json({ 
        success: false, 
        error: `Too many failed login attempts. Account temporarily locked for ${rateCheck.remainingSec} seconds.` 
      }, 429);
    }

    const user = await c.env.DB.prepare(`SELECT id, email, passwordHash, salt, role, clubId, fullName FROM users WHERE email = ?`)
      .bind(email).first<{ id: string; email: string; passwordHash: string; salt: string | null; role: string; clubId: string; fullName?: string }>();

    if (!user) {
      await recordFailedLogin(c.env.DB, email);
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
      await recordFailedLogin(c.env.DB, email);
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    await recordSuccessfulLogin(c.env.DB, email);

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

// ACTION REQUIRED: Configure Cloudflare WAF Rate Limiting for this endpoint to prevent brute-force attacks.
app.post('/auth/google', async (c) => {
  try {
    const { credential } = await c.req.json();
    if (!credential) {
      return c.json({ success: false, error: 'Credential token is required' }, 400);
    }

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
      exp: Math.floor(Date.now() / 1000) + 86400 * 7
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
// Origin / CSRF Verification Middleware for State Mutations
// -------------------------------------------------------------
app.use('/*', async (c, next) => {
  const method = c.req.method.toUpperCase();
  
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const path = c.req.path;
    if (path.includes('/cashfree/webhook')) {
      return next();
    }

    const origin = c.req.header('Origin') || c.req.header('Referer');
    const host = c.req.header('Host');

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        const appUrl = c.env.APP_URL;
        const allowedOriginsEnv = c.env.ALLOWED_ORIGINS || '';

        const allowedSet = new Set<string>();
        if (appUrl) {
          try { allowedSet.add(new URL(appUrl).host); } catch {}
        }
        allowedOriginsEnv.split(',').forEach(o => {
          const trimmed = o.trim();
          if (trimmed) {
            try { allowedSet.add(new URL(trimmed).host); } catch {}
          }
        });
        allowedSet.add('localhost');
        allowedSet.add('127.0.0.1');

        if (allowedSet.size <= 2 && !appUrl && !allowedOriginsEnv) {
          console.warn('SECURITY WARNING: APP_URL or ALLOWED_ORIGINS is unset. CSRF allowlist is strictly limited to localhost.');
        }

        const isAllowed = originUrl.host === host || allowedSet.has(originUrl.host);

        if (!isAllowed) {
          return c.json({ success: false, error: 'Forbidden: CSRF / Invalid Request Origin' }, 403);
        }
      } catch (e) {
        return c.json({ success: false, error: 'Forbidden: Malformed Origin' }, 403);
      }
    }
  }
  await next();
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
// Tenant Suspension & Expiry Enforcement Middleware (TASK 2)
// -------------------------------------------------------------
app.use('/*', async (c, next) => {
  const path = c.req.path;
  const method = c.req.method.toUpperCase();

  if (
    path.startsWith('/api/health') ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/cashfree/webhook') ||
    path.startsWith('/api/cashfree/create-order') ||
    path.startsWith('/api/cashfree/verify-order') ||
    path.startsWith('/api/admin/') ||
    (path === '/api/club/profile' && method === 'GET') ||
    (path === '/api/support/tickets' && method === 'POST')
  ) {
    return next();
  }

  const user = c.get('jwtPayload' as any) as any;
  if (user && user.role === 'superadmin') {
    return next();
  }

  if (user && user.clubId) {
    const profile = await c.env.DB.prepare(`SELECT tenantStatus, renewalDueDate FROM club_profiles WHERE id = ?`).bind(user.clubId).first<{ tenantStatus: string; renewalDueDate: string | null }>();
    if (profile) {
      if (profile.tenantStatus === 'SUSPENDED' || profile.tenantStatus === 'EXPIRED') {
        return c.json({
          success: false,
          error: 'TENANT_SUSPENDED',
          message: 'SaaS subscription has expired or is suspended. Please renew via Cashfree.'
        }, 402);
      }
    }
  }

  return next();
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
  const query = c.req.query();
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '100', 10) || 100));
  const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
  const { results } = await c.env.DB.prepare(`SELECT * FROM game_assets WHERE clubId = ? AND status != 'archived' ORDER BY name ASC LIMIT ? OFFSET ?`).bind(clubId, limit, offset).all();
  return c.json({ success: true, assets: results });
});

app.post('/assets', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  
  // Task 7: Input validation
  const hourlyRate = Number(body.hourlyRate);
  if (isNaN(hourlyRate) || !isFinite(hourlyRate) || hourlyRate < 0) {
    return c.json({ success: false, error: 'Invalid hourlyRate' }, 400);
  }

  const id = body.id || `ast_${Date.now()}`;
  
  await c.env.DB.prepare(`
    INSERT INTO game_assets (id, clubId, name, category, hourlyRate, billingIncrement, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, clubId, body.name, body.category, hourlyRate, body.billingIncrement || 'per_minute', body.status || 'available').run();
  
  return c.json({ success: true, id });
});

app.put('/assets/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();
  
  // Task 7: Input validation
  const hourlyRate = Number(body.hourlyRate);
  if (isNaN(hourlyRate) || !isFinite(hourlyRate) || hourlyRate < 0) {
    return c.json({ success: false, error: 'Invalid hourlyRate' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE game_assets 
    SET name = ?, category = ?, hourlyRate = ?, billingIncrement = ?, status = ?
    WHERE id = ? AND clubId = ?
  `).bind(body.name, body.category, hourlyRate, body.billingIncrement || 'per_minute', body.status || 'available', id, clubId).run();

  return c.json({ success: true });
});

app.delete('/assets/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  
  await c.env.DB.prepare(`UPDATE game_assets SET status = 'archived' WHERE id = ? AND clubId = ?`).bind(id, clubId).run();
  return c.json({ success: true });
});

// -------------------------------------------------------------
// Customers & Ledgers (CRM)
// -------------------------------------------------------------
app.get('/customers', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const query = c.req.query();
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '100', 10) || 100));
  const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
  const { results } = await c.env.DB.prepare(`SELECT * FROM customers WHERE clubId = ? ORDER BY name ASC LIMIT ? OFFSET ?`).bind(clubId, limit, offset).all();
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

  // Task 7: Input validation for financial mutation
  const amt = Number(deltaAmount);
  if (isNaN(amt) || !isFinite(amt) || Math.abs(amt) > 1000000) {
    return c.json({ success: false, error: 'Invalid or out-of-range deltaAmount' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE customers 
    SET ledgerBalance = ledgerBalance + ? 
    WHERE id = ? AND clubId = ?
  `).bind(amt, id, clubId).run();

  return c.json({ success: true });
});

// -------------------------------------------------------------
// Bar & Inventory Endpoints
// -------------------------------------------------------------
app.get('/bar_items', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const query = c.req.query();
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '100', 10) || 100));
  const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
  const { results } = await c.env.DB.prepare(`SELECT * FROM bar_items WHERE clubId = ? AND stock >= 0 ORDER BY name ASC LIMIT ? OFFSET ?`).bind(clubId, limit, offset).all();
  return c.json({ success: true, barItems: results });
});

app.post('/bar_items', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();

  // Task 7: Input validation
  const price = Number(body.price);
  const stock = Number(body.stock);
  if (isNaN(price) || !isFinite(price) || price < 0 || isNaN(stock) || !isFinite(stock) || stock < 0) {
    return c.json({ success: false, error: 'Invalid price or stock' }, 400);
  }

  const id = body.id || `bar_${Date.now()}`;

  await c.env.DB.prepare(`
    INSERT INTO bar_items (id, clubId, name, category, price, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, clubId, body.name, body.category, price, stock).run();

  return c.json({ success: true, id });
});

app.post('/bar_items/:id/stock', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { deltaStock } = await c.req.json<any>();

  // Task 7: Input validation
  const ds = Number(deltaStock);
  if (isNaN(ds) || !isFinite(ds)) {
    return c.json({ success: false, error: 'Invalid deltaStock' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE bar_items 
    SET stock = MAX(0, stock + ?)
    WHERE id = ? AND clubId = ?
  `).bind(ds, id, clubId).run();

  return c.json({ success: true });
});

app.put('/bar_items/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const body = await c.req.json<any>();

  const price = Number(body.price);
  const stock = Number(body.stock);
  if (isNaN(price) || !isFinite(price) || price < 0 || isNaN(stock) || !isFinite(stock) || stock < 0) {
    return c.json({ success: false, error: 'Invalid price or stock' }, 400);
  }

  await c.env.DB.prepare(`
    UPDATE bar_items 
    SET name = ?, category = ?, price = ?, stock = ?
    WHERE id = ? AND clubId = ?
  `).bind(body.name, body.category, price, stock, id, clubId).run();

  return c.json({ success: true });
});

app.delete('/bar_items/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';

  await c.env.DB.prepare(`UPDATE bar_items SET stock = -1 WHERE id = ? AND clubId = ?`).bind(id, clubId).run();

  return c.json({ success: true });
});

// -------------------------------------------------------------
// Game Sessions & Live Table Operations
// -------------------------------------------------------------
app.get('/sessions', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const query = c.req.query();
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '100', 10) || 100));
  const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
  const { results } = await c.env.DB.prepare(`SELECT * FROM game_sessions WHERE clubId = ? AND status = 'running' LIMIT ? OFFSET ?`).bind(clubId, limit, offset).all();
  
  const sessions = results.map((r: any) => ({
    ...r,
    taggedPlayers: r.taggedPlayers ? JSON.parse(r.taggedPlayers) : [],
    attachedBarOrders: r.attachedBarOrders ? JSON.parse(r.attachedBarOrders) : []
  }));

  return c.json({ success: true, sessions });
});

app.post('/sessions', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const session = await c.req.json<any>();
  const id = session.id || `sess_${Date.now()}`;

  const stmt1 = c.env.DB.prepare(`
    INSERT INTO game_sessions (id, clubId, assetId, assetName, category, hourlyRate, billingIncrement, matchType, taggedPlayers, startTime, pausedAt, totalPausedDuration, attachedBarOrders, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id ?? null,
    clubId ?? null,
    session.assetId ?? null,
    session.assetName ?? null,
    session.category ?? null, 
    Number(session.hourlyRate) || 0, 
    session.billingIncrement || 'per_minute',
    session.matchType || 'standard', 
    JSON.stringify(session.taggedPlayers || []), 
    session.startTime || Date.now(), 
    null, 0, 
    JSON.stringify(session.attachedBarOrders || []), 
    'running'
  );

  const stmt2 = c.env.DB.prepare(`UPDATE game_assets SET status = 'occupied' WHERE id = ? AND clubId = ?`).bind(session.assetId ?? null, clubId ?? null);

  try {
    await c.env.DB.batch([stmt1, stmt2]);
    return c.json({ success: true, id });
  } catch (err: any) {
    console.error("Failed to create session batch:", err);
    return c.json({ success: false, error: 'Database transaction failed: ' + (err.message || 'Batch execution error') }, 500);
  }
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
    const pauseElapsed = Math.floor((Date.now() - session.pausedAt) / 1000); // seconds
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

// TASK 1: Server authoritative billing calculation on session end
app.post('/sessions/:id/end', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const settlement = await c.req.json<any>().catch(() => ({}));

  try {
    const session = await c.env.DB.prepare(`SELECT * FROM game_sessions WHERE id = ? AND clubId = ?`).bind(id ?? null, clubId ?? null).first<any>();
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }

    const now = Date.now();
    let effectiveEndTime = now;
    if (session.status === 'paused' && session.pausedAt) {
      effectiveEndTime = session.pausedAt;
    } else if (session.status === 'ended' && session.endedAt) {
      effectiveEndTime = session.endedAt;
    }

    const elapsedMs = Math.max(0, effectiveEndTime - session.startTime - ((session.totalPausedDuration || 0) * 1000));
    const rawMinutes = elapsedMs / 60000;

    let billedMinutes = rawMinutes;
    const incr = session.billingIncrement || 'per_minute';
    if (incr === '15min' || incr === 'per_15_min') {
      const blocks = Math.ceil(rawMinutes / 15) || 1;
      billedMinutes = blocks * 15;
    } else if (incr === 'per_30_min') {
      const blocks = Math.ceil(rawMinutes / 30) || 1;
      billedMinutes = blocks * 30;
    } else if (incr === 'per_hour') {
      const blocks = Math.ceil(rawMinutes / 60) || 1;
      billedMinutes = blocks * 60;
    }

    const gameCost = Math.round((billedMinutes / 60) * (Number(session.hourlyRate) || 0));
    const barOrders = session.attachedBarOrders ? JSON.parse(session.attachedBarOrders) : [];
    const barCost = barOrders.reduce((acc: number, item: any) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);

    const serverComputedTotal = gameCost + barCost;
    const clientReportedAmount = Number(settlement.finalBillAmount) || serverComputedTotal;
    const discountAmount = Number(settlement.discountAmount) || 0;
    const discountReason = settlement.discountReason || '';

    // Enforce server authoritative bill amount
    const finalBillAmount = Math.max(0, serverComputedTotal - discountAmount);

    if (Math.abs(clientReportedAmount - finalBillAmount) > 10) {
      const logId = `aud_diff_${Date.now()}`;
      await c.env.DB.prepare(`
        INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        logId,
        'BILLING_DISCREPANCY_WARNING',
        user?.email || 'system',
        clubId,
        'Club Session',
        'warning',
        JSON.stringify({ sessionId: id, serverComputedTotal, clientReportedAmount, discountAmount, finalBillAmount }),
        new Date().toISOString()
      ).run().catch(() => {});
    }

    const stmt1 = c.env.DB.prepare(`
      UPDATE game_sessions 
      SET status = 'ended', endedAt = ?, finalBillAmount = ?, paymentMethod = ? 
      WHERE id = ? AND clubId = ?
    `).bind(now, finalBillAmount, settlement.paymentMethod || 'UPI', id ?? null, clubId ?? null);

    if (session && session.assetId) {
      const stmt2 = c.env.DB.prepare(`UPDATE game_assets SET status = 'available' WHERE id = ? AND clubId = ?`).bind(session.assetId ?? null, clubId ?? null);
      await c.env.DB.batch([stmt1, stmt2]);
    } else {
      await stmt1.run();
    }

    return c.json({ success: true, finalBillAmount, serverComputedTotal });
  } catch (err: any) {
    console.error("Failed to end session batch:", err);
    return c.json({ success: false, error: 'Failed to end session: ' + (err.message || 'Batch execution error') }, 500);
  }
});

// -------------------------------------------------------------
// Razorpay PG Configuration & Subscriptions
// -------------------------------------------------------------
app.get('/razorpay/config', requireSuperAdmin, async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM razorpay_config ORDER BY id DESC LIMIT 1`).first<any>();
  const config = result || {};
  return c.json({ 
    success: true, 
    config: { 
      environment: config.environment || 'TEST',
      testKeyId: config.testKeyId || 'rzp_test_TdRGvNKTbEnSja',
      liveKeyId: config.liveKeyId || '',
      isEnabled: Boolean(config.isEnabled),
      hasTestKeySecret: Boolean(config.testKeySecret && config.testKeySecret.trim().length > 0),
      hasLiveKeySecret: Boolean(config.liveKeySecret && config.liveKeySecret.trim().length > 0),
      hasWebhookSecret: Boolean(config.webhookSecret && config.webhookSecret.trim().length > 0),
    } 
  });
});

app.post('/razorpay/config', requireSuperAdmin, async (c) => {
  const body = await c.req.json<any>();
  const existingConfig = await c.env.DB.prepare(`SELECT * FROM razorpay_config ORDER BY id DESC LIMIT 1`).first<any>();

  const testKeySecret = (body.testKeySecret && body.testKeySecret.trim()) 
    ? body.testKeySecret 
    : (existingConfig?.testKeySecret || 'NBV6sxLsejkX6zcwmPZ3nfhz');
  const liveKeySecret = (body.liveKeySecret && body.liveKeySecret.trim()) 
    ? body.liveKeySecret 
    : (existingConfig?.liveKeySecret || '');
  const webhookSecret = (body.webhookSecret && body.webhookSecret.trim()) 
    ? body.webhookSecret 
    : (existingConfig?.webhookSecret || '');

  await c.env.DB.prepare(`
    INSERT INTO razorpay_config (environment, testKeyId, testKeySecret, liveKeyId, liveKeySecret, isEnabled, webhookSecret, lastTestedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    body.environment || 'TEST', 
    body.testKeyId || 'rzp_test_TdRGvNKTbEnSja', 
    testKeySecret, 
    body.liveKeyId || '', 
    liveKeySecret, 
    body.isEnabled ? 1 : 0, 
    webhookSecret, 
    new Date().toISOString()
  ).run();

  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'RAZORPAY_CONFIG_UPDATED',
    adminEmail,
    'SYSTEM',
    'JustClub Platform',
    'warning',
    JSON.stringify({ environment: body.environment || 'TEST', isEnabled: body.isEnabled ? 1 : 0 }),
    timestamp
  ).run();
  
  return c.json({ success: true, message: 'Razorpay configuration saved' });
});

async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secretKey: string): Promise<boolean> {
  try {
    const text = `${orderId}|${paymentId}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(text);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const hmacBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const hashArray = Array.from(new Uint8Array(hmacBuffer));
    const generatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return timingSafeEqual(generatedSignature, signature);
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return false;
  }
}

const handleCreateOrder = async (c: any) => {
  try {
    const user = c.get('jwtPayload' as any) as any;
    const body = (await c.req.json()) as any;
    
    const tenantId = user?.clubId || body.tenantId || 'club_001';
    const amountInPaise = Number(body.amount) || 49900;
    if (amountInPaise < 100) {
      return c.json({ success: false, error: 'Minimum amount must be at least 100 paise (₹1)' }, 400);
    }

    const config = (await c.env.DB.prepare(`SELECT * FROM razorpay_config ORDER BY id DESC LIMIT 1`).first()) as any;
    const environment = config?.environment || 'TEST';
    const keyId = environment === 'PRODUCTION' ? config?.liveKeyId : config?.testKeyId;
    const keySecret = environment === 'PRODUCTION' ? config?.liveKeySecret : config?.testKeySecret;

    const finalKeyId = keyId || c.env.RAZORPAY_KEY_ID || 'rzp_test_TdRGvNKTbEnSja';
    const finalKeySecret = keySecret || c.env.RAZORPAY_KEY_SECRET || 'NBV6sxLsejkX6zcwmPZ3nfhz';

    if (!finalKeyId || !finalKeySecret) {
      return c.json({ success: false, error: 'Razorpay API credentials not configured' }, 400);
    }

    const receipt = body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const credentials = btoa(`${finalKeyId}:${finalKeySecret}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: body.currency || 'INR',
        receipt: receipt,
        notes: {
          tenantId: tenantId,
          planId: body.planId || 'monthly'
        }
      })
    });

    let orderId = `order_${Date.now()}`;
    if (rzpRes.ok) {
      const rzpOrder = await rzpRes.json() as any;
      orderId = rzpOrder.id;
    } else {
      const errBody = await rzpRes.text();
      console.warn('Razorpay order API warning (falling back to local order ID):', errBody);
    }

    await c.env.DB.prepare(`
      INSERT INTO razorpay_orders (orderId, orderAmount, orderCurrency, paymentStatus, planName, planId, tenantId, tenantName, customerName, customerEmail, customerPhone, createdAt, environment, promoCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId, 
      amountInPaise, 
      body.currency || 'INR', 
      'PENDING', 
      body.planName || 'Monthly Subscription', 
      body.planId || 'monthly', 
      tenantId, 
      body.tenantName || 'Club', 
      body.customerName || 'Owner', 
      body.customerEmail || 'owner@club.com', 
      body.customerPhone || '9876543210', 
      new Date().toISOString(), 
      environment, 
      body.promoCode || ''
    ).run();

    return c.json({
      success: true,
      orderId,
      amount: amountInPaise,
      currency: body.currency || 'INR',
      keyId: finalKeyId
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to create order' }, 500);
  }
};

app.post('/razorpay/create-order', handleCreateOrder);
app.post('/create-order', handleCreateOrder);

const handleVerifyOrder = async (c: any) => {
  try {
    const user = c.get('jwtPayload' as any) as any;
    const body = (await c.req.json()) as any;
    const orderId = body.orderId || body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return c.json({ success: false, error: 'Missing required payment verification fields (orderId, paymentId, signature)' }, 400);
    }

    const order = (await c.env.DB.prepare(`SELECT * FROM razorpay_orders WHERE orderId = ?`).bind(orderId).first()) as any;
    if (!order) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }

    if (user && user.role !== 'superadmin' && order.tenantId && order.tenantId !== user.clubId) {
      return c.json({ success: false, error: 'Forbidden: Order does not belong to your club' }, 403);
    }

    if (order.paymentStatus === 'SUCCESS') {
      return c.json({ success: true, message: 'Order already verified and processed', order });
    }

    const config = (await c.env.DB.prepare(`SELECT * FROM razorpay_config ORDER BY id DESC LIMIT 1`).first()) as any;
    const environment = config?.environment || 'TEST';
    const keySecret = environment === 'PRODUCTION' ? config?.liveKeySecret : config?.testKeySecret;
    const finalKeySecret = keySecret || c.env.RAZORPAY_KEY_SECRET || 'NBV6sxLsejkX6zcwmPZ3nfhz';

    if (!finalKeySecret) {
      return c.json({ success: false, error: 'Razorpay secret key not configured' }, 400);
    }

    // Verify signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const isValid = await verifyRazorpaySignature(orderId, paymentId, signature, finalKeySecret);

    if (!isValid) {
      return c.json({ success: false, error: 'Signature mismatch: payment verification failed' }, 400);
    }

    const renewedDate = new Date();
    let monthsToAdd = 1;
    if (order.planId === 'quarterly') monthsToAdd = 3;
    if (order.planId === 'yearly') monthsToAdd = 12;
    renewedDate.setMonth(renewedDate.getMonth() + monthsToAdd);

    const stmt1 = c.env.DB.prepare(`
      UPDATE razorpay_orders 
      SET paymentStatus = 'SUCCESS', rzpPaymentId = ?, paymentMethod = ?, paidAt = ?
      WHERE orderId = ?
    `).bind(
      paymentId,
      'UPI / Card',
      new Date().toISOString(),
      orderId
    );

    const stmt2 = c.env.DB.prepare(`
      UPDATE club_profiles 
      SET tenantStatus = 'ACTIVE', renewalDueDate = ?
      WHERE id = ?
    `).bind(renewedDate.toISOString().split('T')[0], order.tenantId);

    await c.env.DB.batch([stmt1, stmt2]);

    const updatedOrder = (await c.env.DB.prepare(`SELECT * FROM razorpay_orders WHERE orderId = ?`).bind(orderId).first()) as any;

    return c.json({ success: true, message: 'Payment verified successfully', order: updatedOrder });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Payment verification failed' }, 500);
  }
};

app.post('/razorpay/verify-order', handleVerifyOrder);
app.post('/verify-payment', handleVerifyOrder);

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

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const logPromise = c.env.DB.prepare(`
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
  ).run().catch(err => console.error("Background audit log error:", err));

  if (c.executionCtx?.waitUntil) {
    c.executionCtx.waitUntil(logPromise);
  } else {
    await logPromise;
  }

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
