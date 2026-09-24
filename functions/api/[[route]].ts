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
  ADMIN_EMAILS?: string;
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

const num = (v: any): number | null => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? null : Number(v);

const getJwtSecret = (c: any) => {
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing. Authentication has failed closed.');
  }
  return secret;
};

async function getTrialPeriodDays(db: D1Database): Promise<number> {
  const row = await db.prepare(`SELECT trialPeriodDays FROM subscription_settings ORDER BY id DESC LIMIT 1`).first<{ trialPeriodDays: number }>();
  return row?.trialPeriodDays ?? 15;
}

async function withIdempotency<T>(
  db: D1Database,
  idempotencyKey: string | null | undefined,
  handler: () => Promise<T>
): Promise<T> {
  if (!idempotencyKey) {
    return handler();
  }
  const existing = await db.prepare(`SELECT responseBody FROM idempotency_keys WHERE requestKey = ?`).bind(idempotencyKey).first<{ responseBody: string }>();
  if (existing) {
    return JSON.parse(existing.responseBody) as T;
  }
  const result = await handler();
  await db.prepare(`INSERT OR IGNORE INTO idempotency_keys (requestKey, responseBody, createdAt) VALUES (?, ?, ?)`)
    .bind(idempotencyKey, JSON.stringify(result), new Date().toISOString())
    .run().catch(() => {});
  return result;
}

function resolveTenantAccess(profile: { tenantStatus: string; renewalDueDate: string | null } | null): 
  { effectiveStatus: string; isExpired: boolean; isSuspended: boolean } {
  if (!profile) return { effectiveStatus: 'ACTIVE', isExpired: false, isSuspended: false };
  if (profile.tenantStatus === 'SUSPENDED') {
    return { effectiveStatus: 'SUSPENDED', isExpired: false, isSuspended: true };
  }
  if ((profile.tenantStatus === 'TRIAL' || profile.tenantStatus === 'ACTIVE') && profile.renewalDueDate) {
    const dueTime = new Date(profile.renewalDueDate + 'T23:59:59').getTime();
    if (Date.now() > dueTime) {
      return { effectiveStatus: 'EXPIRED', isExpired: true, isSuspended: false };
    }
  }
  if (profile.tenantStatus === 'EXPIRED') {
    return { effectiveStatus: 'EXPIRED', isExpired: true, isSuspended: false };
  }
  return { effectiveStatus: profile.tenantStatus, isExpired: false, isSuspended: false };
}

// -------------------------------------------------------------
// Public Routes: Health & Auth
// -------------------------------------------------------------
app.get('/health', (c) => c.json({ status: 'ok', runtime: 'cloudflare-workers-d1', timestamp: new Date().toISOString() }));

// Persistent D1 Rate Limiting Helpers (Repurposed for Google Auth & Endpoint Protection)
async function checkRateLimit(db: D1Database, key: string): Promise<{ allowed: boolean; remainingSec?: number }> {
  const normKey = key.toLowerCase().trim();
  const row = await db.prepare(`SELECT failCount, lockedUntil FROM login_attempts WHERE email = ?`).bind(normKey).first<{ failCount: number; lockedUntil: string | null }>();
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

async function recordFailedLogin(db: D1Database, key: string) {
  const normKey = key.toLowerCase().trim();
  const row = await db.prepare(`SELECT failCount, lockedUntil FROM login_attempts WHERE email = ?`).bind(normKey).first<{ failCount: number; lockedUntil: string | null }>();
  const failCount = (row?.failCount || 0) + 1;
  let lockedUntil: string | null = row?.lockedUntil || null;
  if (failCount >= 5) {
    lockedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  }
  await db.prepare(`
    INSERT INTO login_attempts (email, failCount, lockedUntil, updatedAt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET failCount = ?, lockedUntil = ?, updatedAt = ?
  `).bind(normKey, failCount, lockedUntil, new Date().toISOString(), failCount, lockedUntil, new Date().toISOString()).run();
}

async function recordSuccessfulLogin(db: D1Database, key: string) {
  const normKey = key.toLowerCase().trim();
  await db.prepare(`DELETE FROM login_attempts WHERE email = ?`).bind(normKey).run();
}

// ACTION REQUIRED: Configure Cloudflare WAF Rate Limiting for this endpoint to prevent brute-force attacks.
app.post('/auth/google', async (c) => {
  try {
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'direct';
    const ipRateCheck = await checkRateLimit(c.env.DB, `ip_${clientIp}`);
    if (!ipRateCheck.allowed) {
      return c.json({ 
        success: false, 
        error: `Too many authentication attempts. Please try again in ${ipRateCheck.remainingSec} seconds.` 
      }, 429);
    }

    const { credential } = await c.req.json();
    if (!credential) {
      return c.json({ success: false, error: 'Credential token is required' }, 400);
    }

    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyRes.ok) {
      await recordFailedLogin(c.env.DB, `ip_${clientIp}`);
      return c.json({ success: false, error: 'Google authentication failed' }, 401);
    }

    const googlePayload = await verifyRes.json() as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      aud: string;
    };

    const email = googlePayload.email;
    if (email) {
      const emailRateCheck = await checkRateLimit(c.env.DB, email);
      if (!emailRateCheck.allowed) {
        return c.json({ 
          success: false, 
          error: `Account temporarily locked due to too many failed attempts. Please try again in ${emailRateCheck.remainingSec} seconds.` 
        }, 429);
      }
    }

    const expectedAudience = c.env.GOOGLE_CLIENT_ID;
    if (!expectedAudience || googlePayload.aud !== expectedAudience) {
      await recordFailedLogin(c.env.DB, `ip_${clientIp}`);
      if (email) await recordFailedLogin(c.env.DB, email);
      return c.json({ success: false, error: 'Invalid token audience' }, 401);
    }

    await recordSuccessfulLogin(c.env.DB, `ip_${clientIp}`);
    if (email) await recordSuccessfulLogin(c.env.DB, email);

    const fullName = googlePayload.name || email.split('@')[0];

    let user = await c.env.DB.prepare(`SELECT id, email, role, clubId, fullName FROM users WHERE email = ?`)
      .bind(email).first<{ id: string; email: string; role: string; clubId: string; fullName?: string }>();

    if (!user) {
      const normEmail = email.toLowerCase().trim();
      const adminEmails = (c.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e: string) => e.toLowerCase().trim())
        .filter(Boolean);

      const isSuperAdmin = adminEmails.includes(normEmail);
      const newUserId = `usr_google_${googlePayload.sub}`;
      const role = isSuperAdmin ? 'superadmin' : 'club_owner';
      const clubId = isSuperAdmin ? 'club_001' : `club_${Date.now()}`;

      await c.env.DB.prepare(`
        INSERT INTO users (id, email, passwordHash, salt, role, clubId, fullName)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(newUserId, email, 'google_authenticated_external', 'google', role, clubId, fullName).run();

      if (isSuperAdmin) {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, email, tenantStatus)
          VALUES (?, ?, ?, ?, 'ACTIVE')
        `).bind(clubId, 'JustClub HQ & Showcase Club', fullName, email).run();
      } else {
        const trialDays = await getTrialPeriodDays(c.env.DB);
        const trialEndDate = new Date(Date.now() + trialDays * 86400000).toISOString().split('T')[0];
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO club_profiles (id, businessName, ownerName, email, tenantStatus, renewalDueDate)
          VALUES (?, ?, ?, ?, 'TRIAL', ?)
        `).bind(clubId, `${fullName}'s Club`, fullName, email, trialEndDate).run();
      }

      user = {
        id: newUserId,
        email,
        role,
        clubId,
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
    path.startsWith('/api/auth/google') ||
    path.startsWith('/api/auth/verify') ||
    path.startsWith('/api/pay/') ||
    path.startsWith('/api/subscription-config') ||
    path.startsWith('/subscription-config') ||
    path.startsWith('/api/broadcast') ||
    path.startsWith('/broadcast')
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

  // Always allow: health, auth, admin routes, public payment lookup, and — critically — the payment endpoints themselves,
  // so an expired tenant can still pay to reactivate. Also always allow reading their own profile
  // and filing support tickets while blocked.
  if (
    path.startsWith('/api/health') ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/pay/') ||
    path.startsWith('/api/subscription-config') ||
    path.startsWith('/subscription-config') ||
    path.startsWith('/api/broadcast') ||
    path.startsWith('/broadcast') ||
    path.startsWith('/api/admin/') ||
    path.startsWith('/api/razorpay/create-order') ||
    path.startsWith('/api/create-order') ||
    path.startsWith('/api/razorpay/verify-order') ||
    path.startsWith('/api/verify-payment') ||
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
    const access = resolveTenantAccess(profile);

    // Lazily persist a TRIAL/ACTIVE -> EXPIRED transition the first time it's detected,
    // so the stored row stops relying on a live date comparison every time.
    if (access.isExpired && profile && profile.tenantStatus !== 'EXPIRED') {
      await c.env.DB.prepare(`UPDATE club_profiles SET tenantStatus = 'EXPIRED' WHERE id = ?`).bind(user.clubId).run().catch(() => {});
    }

    if (access.isSuspended) {
      return c.json({
        success: false,
        error: 'TENANT_SUSPENDED',
        message: 'Your account has been suspended by the platform administrator. Please contact support.'
      }, 402);
    }

    if (access.isExpired && method !== 'GET') {
      return c.json({
        success: false,
        error: 'SUBSCRIPTION_REQUIRED',
        message: 'Your free trial or subscription has ended. Subscribe to a plan to continue using POS features.'
      }, 402);
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

// -------------------------------------------------------------
// Club Profile & Payment Link Slugs Endpoints
// -------------------------------------------------------------
app.get('/club/profile', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const profile = await c.env.DB.prepare(`SELECT * FROM club_profiles WHERE id = ?`).bind(clubId).first<any>();
  if (profile) {
    const slugRow = await c.env.DB.prepare(`SELECT slug FROM payment_slugs WHERE clubId = ?`).bind(clubId).first<{ slug: string }>();
    profile.paymentSlug = slugRow?.slug || undefined;
  }
  const access = resolveTenantAccess(profile);
  let daysRemaining: number | null = null;
  if (profile?.renewalDueDate && !access.isExpired && !access.isSuspended) {
    const dueTime = new Date(profile.renewalDueDate + 'T23:59:59').getTime();
    daysRemaining = Math.max(0, Math.ceil((dueTime - Date.now()) / 86400000));
  }
  return c.json({
    success: true,
    profile: profile || null,
    isViewOnly: access.isExpired,
    isSuspended: access.isSuspended,
    daysRemaining
  });
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

  // Sync UPI ID & Business Name in payment_slugs if slug exists for this club
  await c.env.DB.prepare(`
    UPDATE payment_slugs
    SET upiId = ?, businessName = ?, updatedAt = ?
    WHERE clubId = ?
  `).bind(body.upiId || '', body.businessName || '', new Date().toISOString(), clubId).run().catch(() => {});

  return c.json({ success: true, message: 'Profile updated' });
});

// POST /club/payment-slug (Authenticated club owner/staff)
app.post('/club/payment-slug', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId;
  if (!clubId) {
    return c.json({ success: false, error: 'Unauthorized: missing club' }, 401);
  }

  const body = await c.req.json<{ slug?: string }>();
  const cleanSlug = (body.slug || '').toLowerCase().trim();

  const SERVER_RESERVED_SLUGS = new Set([
    'admin', 'superadmin', 'login', 'pay', 'p', 'app', 'pos', 'api',
    'support', 'billing', 'help', 'settings', 'justclub', 'auth'
  ]);

  if (!cleanSlug || !/^[a-z0-9_-]{3,30}$/.test(cleanSlug) || SERVER_RESERVED_SLUGS.has(cleanSlug)) {
    return c.json({
      success: false,
      error: 'Invalid slug format or reserved keyword. Slug must be 3-30 lowercase characters (letters, numbers, hyphens, underscores).'
    }, 400);
  }

  // Fetch real club profile from DB (never trust client-supplied upiId or businessName)
  const clubProfile = await c.env.DB.prepare(`SELECT upiId, businessName FROM club_profiles WHERE id = ?`).bind(clubId).first<{ upiId: string; businessName: string }>();
  if (!clubProfile) {
    return c.json({ success: false, error: 'Club profile not found' }, 404);
  }

  // Check uniqueness across other clubs
  const existing = await c.env.DB.prepare(`SELECT clubId FROM payment_slugs WHERE slug = ?`).bind(cleanSlug).first<{ clubId: string }>();
  if (existing && existing.clubId !== clubId) {
    return c.json({ success: false, error: 'Slug already taken by another club' }, 409);
  }

  // Delete previous slug mapping for this club
  await c.env.DB.prepare(`DELETE FROM payment_slugs WHERE clubId = ?`).bind(clubId).run();

  // Insert new slug mapping
  const now = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO payment_slugs (slug, clubId, upiId, businessName, updatedAt)
    VALUES (?, ?, ?, ?, ?)
  `).bind(cleanSlug, clubId, clubProfile.upiId || '', clubProfile.businessName || '', now).run();

  return c.json({ success: true, slug: cleanSlug });
});

// GET /pay/:slug (PUBLIC - Unauthenticated)
app.get('/pay/:slug', async (c) => {
  const rawSlug = c.req.param('slug');
  const cleanSlug = (rawSlug || '').toLowerCase().trim();

  if (!cleanSlug) {
    return c.json({ success: false, error: 'Slug is required' }, 400);
  }

  const row = await c.env.DB.prepare(`SELECT upiId, businessName FROM payment_slugs WHERE slug = ?`).bind(cleanSlug).first<{ upiId: string; businessName: string }>();

  if (!row) {
    return c.json({ success: false, error: 'Payment link not found' }, 404);
  }

  return c.json({
    success: true,
    upiId: row.upiId,
    businessName: row.businessName
  });
});

// -------------------------------------------------------------
// Global Subscription Plans & Trial Configuration (Public / App Load)
// -------------------------------------------------------------
app.get('/subscription-config', async (c) => {
  const trialPeriodDays = await getTrialPeriodDays(c.env.DB);
  let plans: any[] = [];
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM subscription_plans ORDER BY periodMonths ASC`).all();
    if (results && results.length > 0) {
      plans = results;
    }
  } catch (e) {
    console.warn("Failed to query subscription_plans:", e);
  }

  if (plans.length === 0) {
    plans = [
      { id: 'monthly', name: 'Monthly Plan', amount: 499, periodMonths: 1, discountLabel: 'Standard' },
      { id: 'quarterly', name: '3-Month Plan', amount: 1299, periodMonths: 3, discountLabel: 'Save 13%' },
      { id: 'yearly', name: 'Yearly Plan', amount: 4499, periodMonths: 12, discountLabel: 'Save 25% (2 Mo Free)' }
    ];
  }

  return c.json({
    success: true,
    trialPeriodDays,
    plans
  });
});

// GET /broadcast (Public / Lounge Terminals)
app.get('/broadcast', async (c) => {
  try {
    const row = await c.env.DB.prepare(`SELECT value FROM platform_settings WHERE key = 'active_broadcast'`).first<{ value: string }>();
    return c.json({
      success: true,
      broadcast: row?.value ? JSON.parse(row.value) : null
    });
  } catch (err: any) {
    return c.json({ success: true, broadcast: null });
  }
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
  const billingBasis = body.billingBasis || 'PER_TABLE';
  
  await c.env.DB.prepare(`
    INSERT INTO game_assets (id, clubId, name, category, hourlyRate, billingIncrement, billingBasis, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, clubId, body.name, body.category, hourlyRate, body.billingIncrement || 'per_minute', billingBasis, body.status || 'available').run();
  
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

  const billingBasis = body.billingBasis || 'PER_TABLE';

  await c.env.DB.prepare(`
    UPDATE game_assets 
    SET name = ?, category = ?, hourlyRate = ?, billingIncrement = ?, billingBasis = ?, status = ?
    WHERE id = ? AND clubId = ?
  `).bind(body.name, body.category, hourlyRate, body.billingIncrement || 'per_minute', billingBasis, body.status || 'available', id, clubId).run();

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
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const { deltaAmount } = await c.req.json<any>();

  // Task 7: Input validation for financial mutation
  const amt = Number(deltaAmount);
  if (isNaN(amt) || !isFinite(amt) || Math.abs(amt) > 1000000) {
    return c.json({ success: false, error: 'Invalid or out-of-range deltaAmount' }, 400);
  }

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    await c.env.DB.prepare(`
      UPDATE customers 
      SET ledgerBalance = ledgerBalance + ? 
      WHERE id = ? AND clubId = ?
    `).bind(amt, id, clubId).run();

    return { success: true };
  });

  return c.json(result);
});

app.post('/customers/:id/record-visit', async (c) => {
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const { lifetimeValueDelta, lastVisitedDate } = await c.req.json<any>();

  const delta = Number(lifetimeValueDelta);
  if (isNaN(delta) || !isFinite(delta) || Math.abs(delta) > 1000000) {
    return c.json({ success: false, error: 'Invalid or out-of-range lifetimeValueDelta' }, 400);
  }
  const visitDate = (typeof lastVisitedDate === 'string' && lastVisitedDate) ? lastVisitedDate : new Date().toISOString().split('T')[0];

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    await c.env.DB.prepare(`
      UPDATE customers
      SET totalVisits = totalVisits + 1,
          lastVisitedDate = ?,
          lifetimeValue = lifetimeValue + ?
      WHERE id = ? AND clubId = ?
    `).bind(visitDate, delta, id, clubId).run();

    return { success: true };
  });

  return c.json(result);
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
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const session = await c.req.json<any>();
  const id = session.id || `sess_${Date.now()}`;

  const res = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    const stmt1 = c.env.DB.prepare(`
      INSERT OR IGNORE INTO game_sessions (id, clubId, assetId, assetName, category, hourlyRate, billingIncrement, billingBasis, matchType, taggedPlayers, startTime, pausedAt, totalPausedDuration, attachedBarOrders, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id ?? null,
      clubId ?? null,
      session.assetId ?? null,
      session.assetName ?? null,
      session.category ?? null, 
      Number(session.hourlyRate) || 0, 
      session.billingIncrement || 'per_minute',
      session.billingBasis || 'PER_TABLE',
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
      return { success: true, id };
    } catch (err: any) {
      console.error("Failed to create session batch:", err);
      return { success: false, error: 'Database transaction failed: ' + (err.message || 'Batch execution error') };
    }
  });

  return c.json(res, (res as any).error ? 500 : 200);
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
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user.clubId || 'club_001';
  const order = await c.req.json<any>();

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    const session = await c.env.DB.prepare(`SELECT attachedBarOrders FROM game_sessions WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
    const currentOrders = session?.attachedBarOrders ? JSON.parse(session.attachedBarOrders) : [];
    currentOrders.push(order);

    await c.env.DB.prepare(`
      UPDATE game_sessions 
      SET attachedBarOrders = ? 
      WHERE id = ? AND clubId = ?
    `).bind(JSON.stringify(currentOrders), id, clubId).run();

    return { success: true };
  });

  return c.json(result);
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

    const perTableGameCost = (billedMinutes / 60) * (Number(session.hourlyRate) || 0);
    const taggedPlayers = session.taggedPlayers ? JSON.parse(session.taggedPlayers) : [];
    const numPlayers = Math.max(1, Array.isArray(taggedPlayers) ? taggedPlayers.length : 1);
    const gameCost = session.billingBasis === 'PER_PERSON'
      ? Math.round(perTableGameCost * numPlayers)
      : Math.round(perTableGameCost);
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

app.post('/sessions/:id/reminder', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>().catch(() => ({}));
  const reminderMinutes = body.reminderMinutes !== undefined && body.reminderMinutes !== null ? Number(body.reminderMinutes) : null;

  try {
    await c.env.DB.prepare(`
      UPDATE game_sessions 
      SET reminderMinutes = ? 
      WHERE id = ? AND clubId = ?
    `).bind(reminderMinutes, id, clubId).run();
  } catch (err: any) {
    if (err?.message?.includes('no such column')) {
      await c.env.DB.prepare(`ALTER TABLE game_sessions ADD COLUMN reminderMinutes INTEGER`).run().catch(() => {});
      await c.env.DB.prepare(`
        UPDATE game_sessions 
        SET reminderMinutes = ? 
        WHERE id = ? AND clubId = ?
      `).bind(reminderMinutes, id, clubId).run();
    } else {
      throw err;
    }
  }

  return c.json({ success: true });
});

app.post('/sessions/:id/cancel', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>().catch(() => ({}));
  let session: any = null;

  try {
    session = await c.env.DB.prepare(`SELECT * FROM game_sessions WHERE id = ? AND clubId = ?`).bind(id ?? null, clubId ?? null).first<any>();
    if (!session) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }

    const now = Date.now();
    const stmt1 = c.env.DB.prepare(`
      UPDATE game_sessions 
      SET status = 'cancelled', endedAt = ?, cancellationReason = ? 
      WHERE id = ? AND clubId = ?
    `).bind(now, body.cancelReason || 'Cancelled by staff', id ?? null, clubId ?? null);

    if (session.assetId) {
      const stmt2 = c.env.DB.prepare(`UPDATE game_assets SET status = 'available' WHERE id = ? AND clubId = ?`).bind(session.assetId ?? null, clubId ?? null);
      await c.env.DB.batch([stmt1, stmt2]);
    } else {
      await stmt1.run();
    }

    return c.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes('no such column')) {
      await c.env.DB.prepare(`ALTER TABLE game_sessions ADD COLUMN cancellationReason TEXT`).run().catch(() => {});
      await c.env.DB.prepare(`
        UPDATE game_sessions 
        SET status = 'cancelled', endedAt = ?, cancellationReason = ? 
        WHERE id = ? AND clubId = ?
      `).bind(Date.now(), body.cancelReason || 'Cancelled by staff', id ?? null, clubId ?? null).run();
      if (session?.assetId) {
        await c.env.DB.prepare(`UPDATE game_assets SET status = 'available' WHERE id = ? AND clubId = ?`).bind(session.assetId ?? null, clubId ?? null).run();
      }
      return c.json({ success: true });
    }
    return c.json({ success: false, error: 'Failed to cancel session: ' + err.message }, 500);
  }
});

app.put('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>().catch(() => ({}));

  try {
    const taggedPlayersStr = body.taggedPlayers ? JSON.stringify(body.taggedPlayers) : undefined;
    const attachedOrdersStr = body.attachedBarOrders ? JSON.stringify(body.attachedBarOrders) : undefined;

    await c.env.DB.prepare(`
      UPDATE game_sessions 
      SET matchType = COALESCE(?, matchType),
          taggedPlayers = COALESCE(?, taggedPlayers),
          attachedBarOrders = COALESCE(?, attachedBarOrders)
      WHERE id = ? AND clubId = ?
    `).bind(body.matchType ?? null, taggedPlayersStr ?? null, attachedOrdersStr ?? null, id, clubId).run();

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: 'Failed to update session: ' + err.message }, 500);
  }
});

// -------------------------------------------------------------
// Bills & Finalized Checkout Hub
// -------------------------------------------------------------
app.get('/bills', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const { results } = await c.env.DB.prepare(`SELECT * FROM bills WHERE clubId = ? ORDER BY timestamp DESC LIMIT 200`).bind(clubId).all();

  const bills = results.map((r: any) => ({
    ...r,
    players: r.players ? (typeof r.players === 'string' ? JSON.parse(r.players) : r.players) : [],
    losingPlayerIds: r.losingPlayerIds ? (typeof r.losingPlayerIds === 'string' ? JSON.parse(r.losingPlayerIds) : r.losingPlayerIds) : [],
    winningPlayerIds: r.winningPlayerIds ? (typeof r.winningPlayerIds === 'string' ? JSON.parse(r.winningPlayerIds) : r.winningPlayerIds) : [],
    customBarSplitPlayerIds: r.customBarSplitPlayerIds ? (typeof r.customBarSplitPlayerIds === 'string' ? JSON.parse(r.customBarSplitPlayerIds) : r.customBarSplitPlayerIds) : [],
    shares: r.shares ? (typeof r.shares === 'string' ? JSON.parse(r.shares) : r.shares) : [],
    barItemsSummary: r.barItemsSummary ? (typeof r.barItemsSummary === 'string' ? JSON.parse(r.barItemsSummary) : r.barItemsSummary) : [],
  }));

  return c.json({ success: true, bills });
});

app.post('/bills', async (c) => {
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>();

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    const id = body.id || `bill_${Date.now()}`;
    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO bills (
        id, clubId, billNo, voucherNo, sessionId, assetId, assetName, category, gameType, matchType, 
        hourlyRate, billingIncrement, billingBasis, startTime, endTime, durationMinutes, totalPausedDuration, 
        totalGameCost, totalBarCost, discount, grandTotal, roundOffAmount, players, gameSplitRule, barSplitRule, 
        losingPlayerIds, winningPlayerIds, singlePayerId, customBarSplitPlayerIds, shares, barItemsSummary, status, timestamp, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      clubId,
      body.billNo || '',
      body.voucherNo || null,
      body.sessionId || null,
      body.assetId || null,
      body.assetName || null,
      body.category || null,
      body.gameType || null,
      body.matchType || null,
      Number(body.hourlyRate) || 0,
      body.billingIncrement || null,
      body.billingBasis || 'PER_TABLE',
      body.startTime || null,
      body.endTime || null,
      Number(body.durationMinutes) || 0,
      Number(body.totalPausedDuration) || 0,
      Number(body.totalGameCost) || 0,
      Number(body.totalBarCost) || 0,
      Number(body.discount) || 0,
      Number(body.grandTotal) || 0,
      Number.isFinite(Number(body.roundOffAmount)) ? Number(body.roundOffAmount) : 0,
      typeof body.players === 'string' ? body.players : JSON.stringify(body.players || []),
      body.gameSplitRule || null,
      body.barSplitRule || null,
      typeof body.losingPlayerIds === 'string' ? body.losingPlayerIds : JSON.stringify(body.losingPlayerIds || []),
      typeof body.winningPlayerIds === 'string' ? body.winningPlayerIds : JSON.stringify(body.winningPlayerIds || []),
      body.singlePayerId || null,
      typeof body.customBarSplitPlayerIds === 'string' ? body.customBarSplitPlayerIds : JSON.stringify(body.customBarSplitPlayerIds || []),
      typeof body.shares === 'string' ? body.shares : JSON.stringify(body.shares || []),
      typeof body.barItemsSummary === 'string' ? body.barItemsSummary : JSON.stringify(body.barItemsSummary || []),
      body.status || 'paid',
      body.timestamp || new Date().toISOString(),
      body.notes || ''
    ).run();

    return { success: true, id };
  });

  return c.json(result);
});

app.delete('/bills/:id', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const id = c.req.param('id');

  const bill = await c.env.DB.prepare(`SELECT * FROM bills WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
  if (!bill) {
    return c.json({ success: false, error: 'Bill not found' }, 404);
  }

  // Find associated ledger entries
  const { results: entries } = await c.env.DB.prepare(`
    SELECT * FROM ledger_entries 
    WHERE clubId = ? AND (sessionId = ? OR voucherNo = ? OR voucherNo = ?)
  `).bind(clubId, bill.sessionId || '', bill.voucherNo || '', bill.billNo || '').all<any>();

  const statements: any[] = [];

  for (const entry of (entries || [])) {
    if (entry.status === 'PENDING' && (entry.type === 'DEBIT' || (typeof entry.type === 'string' && entry.type.startsWith('DEBIT')))) {
      const debitAmt = Number(entry.amount) || 0;
      if (debitAmt > 0 && entry.customerId) {
        statements.push(
          c.env.DB.prepare(`UPDATE customers SET ledgerBalance = ledgerBalance + ? WHERE id = ? AND clubId = ?`).bind(debitAmt, entry.customerId, clubId)
        );
      }
    }
    statements.push(
      c.env.DB.prepare(`DELETE FROM ledger_entries WHERE id = ? AND clubId = ?`).bind(entry.id, clubId)
    );
  }

  statements.push(
    c.env.DB.prepare(`DELETE FROM bills WHERE id = ? AND clubId = ?`).bind(id, clubId)
  );

  await c.env.DB.batch(statements);

  // Write audit log
  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp, clubId, performedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'BILL_DELETED',
    user?.email || null,
    clubId,
    bill.assetName || 'Club',
    'warning',
    JSON.stringify({ billId: id, billNo: bill.billNo, grandTotal: bill.grandTotal, reversedEntriesCount: (entries || []).length }),
    timestamp,
    clubId,
    user?.email || 'user'
  ).run().catch(() => {});

  return c.json({ success: true, message: 'Bill deleted and ledger balances reconciled' });
});

app.post('/bills/clear-all', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  if (!user || (user.role !== 'club_owner' && user.role !== 'superadmin' && user.role !== 'owner')) {
    return c.json({ success: false, error: 'Forbidden: club owner or superadmin permission required' }, 403);
  }
  const clubId = user?.clubId || 'club_001';

  const { results: debitEntries } = await c.env.DB.prepare(`
    SELECT * FROM ledger_entries 
    WHERE clubId = ? AND status = 'PENDING' AND type LIKE 'DEBIT%'
  `).bind(clubId).all<any>();

  const statements: any[] = [];
  for (const entry of (debitEntries || [])) {
    const debitAmt = Number(entry.amount) || 0;
    if (debitAmt > 0 && entry.customerId) {
      statements.push(
        c.env.DB.prepare(`UPDATE customers SET ledgerBalance = ledgerBalance + ? WHERE id = ? AND clubId = ?`).bind(debitAmt, entry.customerId, clubId)
      );
    }
  }

  // Delete all debit-type ledger entries (keeping CREDIT_PAYMENT and SETTLEMENT)
  statements.push(
    c.env.DB.prepare(`DELETE FROM ledger_entries WHERE clubId = ? AND type LIKE 'DEBIT%'`).bind(clubId)
  );

  // Delete all bills
  statements.push(
    c.env.DB.prepare(`DELETE FROM bills WHERE clubId = ?`).bind(clubId)
  );

  await c.env.DB.batch(statements);

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp, clubId, performedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'BILLS_CLEARED_ALL',
    user?.email || null,
    clubId,
    'All Bills Cleared',
    'danger',
    JSON.stringify({ clubId, reversedDuesCount: (debitEntries || []).length }),
    timestamp,
    clubId,
    user?.email || 'user'
  ).run().catch(() => {});

  return c.json({ success: true, message: 'All bills cleared and customer ledgers updated' });
});

app.post('/bills/:id/settle', async (c) => {
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    await c.env.DB.prepare(`UPDATE bills SET status = 'SETTLED' WHERE id = ? AND clubId = ?`).bind(id, clubId).run();
    return { success: true };
  });

  return c.json(result);
});

// -------------------------------------------------------------
// Customer Ledger Transactions & Khata History
// -------------------------------------------------------------
app.get('/ledger-entries', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const { results } = await c.env.DB.prepare(`SELECT * FROM ledger_entries WHERE clubId = ? ORDER BY timestamp DESC LIMIT 300`).bind(clubId).all();

  const ledgerEntries = results.map((r: any) => ({
    ...r,
    barItemsSummary: r.barItemsSummary ? (typeof r.barItemsSummary === 'string' ? JSON.parse(r.barItemsSummary) : r.barItemsSummary) : [],
    coPlayers: r.coPlayers ? (typeof r.coPlayers === 'string' ? JSON.parse(r.coPlayers) : r.coPlayers) : [],
    isLoser: Boolean(r.isLoser),
  }));

  return c.json({ success: true, ledgerEntries });
});

app.post('/ledger-entries', async (c) => {
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>();

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    const id = body.id || `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO ledger_entries (
        id, clubId, voucherNo, customerId, customerName, customerPhone, type, amount,
        sessionId, assetName, assetCategory, description, paymentMethod, timestamp, status,
        settledAt, settledMethod, settlementRef, gameShare, totalGameCost, durationMinutes,
        hourlyRate, matchType, barShare, totalBarCost, barItemsSummary, splitRule, barSplitRule,
        isLoser, coPlayers, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, clubId,
      body.voucherNo || `LED-${id}`,
      body.customerId || '', body.customerName || '', body.customerPhone || null,
      body.type || 'DEBIT', Number(body.amount) || 0,
      body.sessionId || null, body.assetName || null, body.assetCategory || null,
      body.description || '(no description)',
      body.paymentMethod || null, body.timestamp || new Date().toISOString(),
      body.status || 'PENDING', body.settledAt || null, body.settledMethod || null, body.settlementRef || null,
      num(body.gameShare), num(body.totalGameCost), num(body.durationMinutes),
      num(body.hourlyRate), body.matchType || null,
      num(body.barShare), num(body.totalBarCost),
      typeof body.barItemsSummary === 'string' ? body.barItemsSummary : JSON.stringify(body.barItemsSummary || []),
      body.splitRule || null, body.barSplitRule || null,
      body.isLoser ? 1 : 0,
      typeof body.coPlayers === 'string' ? body.coPlayers : JSON.stringify(body.coPlayers || []),
      body.notes || null
    ).run();

    return { success: true, id };
  });

  return c.json(result);
});

app.post('/ledger-entries/reconcile', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';

  const { results: debitEntries } = await c.env.DB.prepare(`
    SELECT * FROM ledger_entries WHERE clubId = ? AND type LIKE 'DEBIT%'
  `).bind(clubId).all<any>();

  const { results: bills } = await c.env.DB.prepare(`
    SELECT id, billNo, voucherNo, sessionId FROM bills WHERE clubId = ?
  `).bind(clubId).all<any>();

  const validBillKeys = new Set<string>();
  for (const b of (bills || [])) {
    if (b.id) validBillKeys.add(String(b.id));
    if (b.sessionId) validBillKeys.add(String(b.sessionId));
    if (b.billNo) validBillKeys.add(String(b.billNo));
    if (b.voucherNo) validBillKeys.add(String(b.voucherNo));
  }

  const orphaned: any[] = [];
  for (const entry of (debitEntries || [])) {
    const hasMatch = (entry.sessionId && validBillKeys.has(String(entry.sessionId))) ||
                     (entry.voucherNo && validBillKeys.has(String(entry.voucherNo)));
    if (!hasMatch) {
      orphaned.push(entry);
    }
  }

  if (orphaned.length > 0) {
    const statements: any[] = [];
    for (const entry of orphaned) {
      if (entry.status === 'PENDING') {
        const debitAmt = Number(entry.amount) || 0;
        if (debitAmt > 0 && entry.customerId) {
          statements.push(
            c.env.DB.prepare(`UPDATE customers SET ledgerBalance = ledgerBalance + ? WHERE id = ? AND clubId = ?`).bind(debitAmt, entry.customerId, clubId)
          );
        }
      }
      statements.push(
        c.env.DB.prepare(`DELETE FROM ledger_entries WHERE id = ? AND clubId = ?`).bind(entry.id, clubId)
      );
    }
    await c.env.DB.batch(statements);
  }

  return c.json({
    success: true,
    purgedCount: orphaned.length,
    message: `Purged ${orphaned.length} orphaned dues`
  });
});

app.delete('/ledger-entries/:id', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const id = c.req.param('id');

  const entry = await c.env.DB.prepare(`SELECT * FROM ledger_entries WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
  if (!entry) {
    return c.json({ success: false, error: 'Ledger entry not found' }, 404);
  }

  const statements: any[] = [];
  if (entry.status === 'PENDING' && (entry.type === 'DEBIT' || (typeof entry.type === 'string' && entry.type.startsWith('DEBIT')))) {
    const debitAmt = Number(entry.amount) || 0;
    if (debitAmt > 0 && entry.customerId) {
      statements.push(
        c.env.DB.prepare(`UPDATE customers SET ledgerBalance = ledgerBalance + ? WHERE id = ? AND clubId = ?`).bind(debitAmt, entry.customerId, clubId)
      );
    }
  }
  statements.push(
    c.env.DB.prepare(`DELETE FROM ledger_entries WHERE id = ? AND clubId = ?`).bind(id, clubId)
  );

  await c.env.DB.batch(statements);
  return c.json({ success: true, message: 'Ledger entry deleted' });
});

app.post('/ledger-entries/:id/settle', async (c) => {
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const id = c.req.param('id');
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>().catch(() => ({}));

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    await c.env.DB.prepare(`
      UPDATE ledger_entries
      SET status = 'SETTLED', settledAt = ?, settledMethod = ?, settlementRef = ?
      WHERE id = ? AND clubId = ?
    `).bind(new Date().toISOString(), body.settledMethod || null, body.settlementRef || null, id, clubId).run();
    return { success: true };
  });

  return c.json(result);
});

// -------------------------------------------------------------
// Operational Club Expenses
// -------------------------------------------------------------
app.get('/expenses', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';

  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  const includeVoided = c.req.query('includeVoided') === 'true';
  const limit = Math.min(Number(c.req.query('limit')) || 100, 300);
  const offset = Number(c.req.query('offset')) || 0;

  let query = `SELECT * FROM club_expenses WHERE clubId = ?`;
  const params: any[] = [clubId];

  if (!includeVoided) {
    query += ` AND status = 'ACTIVE'`;
  }

  if (startDate && endDate) {
    query += ` AND expenseDate >= ? AND expenseDate <= ?`;
    params.push(startDate, endDate);
  }

  query += ` ORDER BY expenseDate DESC, createdAt DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ success: true, expenses: results });
});

app.post('/expenses', async (c) => {
  const idempotencyKey = c.req.header('X-Idempotency-Key') || null;
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';
  const body = await c.req.json<any>();

  const allowedCategories = [
    'RENT',
    'ELECTRICITY',
    'SALARY',
    'INTERNET_SOFTWARE',
    'BAR_PURCHASE',
    'MAINTENANCE',
    'SUPPLIES',
    'MISC'
  ];

  if (!body.category || !allowedCategories.includes(body.category)) {
    return c.json({ success: false, error: 'Invalid expense category' }, 400);
  }

  const amount = Number(body.amount);
  if (isNaN(amount) || amount <= 0 || !isFinite(amount)) {
    return c.json({ success: false, error: 'Amount must be a positive number' }, 400);
  }

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return c.json({ success: false, error: 'Title is required' }, 400);
  }

  const allowedPayments = ['CASH', 'UPI', 'BANK'];
  const paymentMethod = (body.paymentMethod || 'CASH').toUpperCase();
  if (!allowedPayments.includes(paymentMethod)) {
    return c.json({ success: false, error: 'Invalid payment method' }, 400);
  }

  const result = await withIdempotency(c.env.DB, idempotencyKey, async () => {
    const id = body.id || `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const expenseDate = body.expenseDate || new Date().toISOString().split('T')[0];
    const createdAt = new Date().toISOString();
    const loggedByEmail = user?.email || 'owner@club.pos';
    const status = 'ACTIVE';

    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO club_expenses (
        id, clubId, category, title, amount, paymentMethod, receiptNo, expenseDate, notes, status, voidReason, loggedByEmail, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      clubId,
      body.category,
      body.title.trim(),
      amount,
      paymentMethod,
      body.receiptNo || null,
      expenseDate,
      body.notes || null,
      status,
      null,
      loggedByEmail,
      createdAt
    ).run();

    // Write audit log entry
    const logId = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await c.env.DB.prepare(`
      INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      logId,
      'Logged Expense',
      loggedByEmail,
      clubId,
      null,
      'info',
      JSON.stringify({ category: body.category, amount, title: body.title.trim() }),
      createdAt
    ).run().catch(() => {});

    return { success: true, id };
  });

  return c.json(result);
});

app.post('/expenses/:id/void', async (c) => {
  const user = c.get('jwtPayload' as any) as any;
  const clubId = user?.clubId || 'club_001';

  if (user?.role !== 'club_owner' && user?.role !== 'superadmin') {
    return c.json({ success: false, error: 'Forbidden: Only club owners can void expenses' }, 403);
  }

  const id = c.req.param('id');
  const body = await c.req.json<any>();
  const reason = body?.reason;

  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return c.json({ success: false, error: 'Void reason is required' }, 400);
  }

  const existing = await c.env.DB.prepare(`SELECT * FROM club_expenses WHERE id = ? AND clubId = ?`).bind(id, clubId).first<any>();
  if (!existing) {
    return c.json({ success: false, error: 'Expense not found' }, 404);
  }

  if (existing.status === 'VOIDED') {
    return c.json({ success: true, message: 'Expense already voided' });
  }

  await c.env.DB.prepare(`
    UPDATE club_expenses SET status = 'VOIDED', voidReason = ? WHERE id = ? AND clubId = ?
  `).bind(reason.trim(), id, clubId).run();

  // Audit log entry
  const logId = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'Voided Expense',
    user?.email || 'owner@club.pos',
    clubId,
    null,
    'danger',
    JSON.stringify({ expenseId: id, reason: reason.trim(), originalAmount: existing.amount, originalCategory: existing.category, title: existing.title }),
    now
  ).run().catch(() => {});

  return c.json({ success: true, id });
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
      testKeyId: config.testKeyId || '',
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
    : (existingConfig?.testKeySecret || '');
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
    body.testKeyId || '', 
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

    if (!config?.isEnabled) {
      return c.json({ success: false, error: 'Payments are currently disabled. Enable Razorpay in the Superadmin panel.' }, 400);
    }

    const finalKeyId = keyId;
    const finalKeySecret = keySecret;

    if (!finalKeyId || !finalKeySecret) {
      return c.json({ success: false, error: 'Razorpay is not configured' }, 400);
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
      const rzpOrder = (await rzpRes.json()) as any;
      orderId = rzpOrder.id;
    } else {
      const errStatus = rzpRes.status;
      const errBody = await rzpRes.text();
      console.error('Razorpay API error response:', errStatus, errBody);
      
      if (errStatus === 401) {
        return c.json({ success: false, error: 'Razorpay authentication failed: Invalid Key ID or Key Secret.' }, 401);
      }
      
      let errMsg = 'Failed to create order on Razorpay';
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error?.description) {
          errMsg = parsed.error.description;
        }
      } catch (_) {}
      
      return c.json({ success: false, error: errMsg }, 500);
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
      order_id: orderId,
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
    const orderId = body.orderId || body.order_id || body.razorpay_order_id;
    const paymentId = body.paymentId || body.razorpay_payment_id;
    const signature = body.signature || body.razorpay_signature;

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
    const finalKeySecret = keySecret;

    if (!finalKeySecret) {
      return c.json({ success: false, error: 'Razorpay is not configured' }, 400);
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
app.get('/admin/subscription-settings', requireSuperAdmin, async (c) => {
  const trialPeriodDays = await getTrialPeriodDays(c.env.DB);
  return c.json({ success: true, trialPeriodDays });
});

app.post('/admin/subscription-settings', requireSuperAdmin, async (c) => {
  const body = await c.req.json<any>();
  const trialDays = Number(body.trialPeriodDays);
  if (!Number.isInteger(trialDays) || trialDays < 1 || trialDays > 365) {
    return c.json({ success: false, error: 'trialPeriodDays must be an integer between 1 and 365' }, 400);
  }

  await c.env.DB.prepare(`
    INSERT INTO subscription_settings (trialPeriodDays, updatedAt)
    VALUES (?, ?)
  `).bind(trialDays, new Date().toISOString()).run();

  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'TRIAL_PERIOD_UPDATED',
    adminEmail,
    'SYSTEM',
    'JustClub Platform',
    'info',
    JSON.stringify({ trialPeriodDays: trialDays }),
    timestamp
  ).run();

  return c.json({ success: true, trialPeriodDays: trialDays });
});

app.get('/admin/tenants', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM club_profiles ORDER BY businessName ASC`).all();
  const formattedTenants = (results || []).map((row: any) => ({
    id: row.id,
    businessName: row.businessName || 'Unnamed Club',
    ownerName: row.ownerName || 'Club Owner',
    whatsapp: row.whatsapp || '',
    city: row.city || 'India',
    status: row.tenantStatus || row.status || 'ACTIVE',
    subscriptionDueDate: row.renewalDueDate || row.subscriptionDueDate || '2026-10-15',
    activeAssetsCount: Number(row.activeTableCount || row.activeAssetsCount || 4),
    monthlyRevenue: Number(row.totalRevenueThisMonth || row.monthlyRevenue || 0),
  }));
  return c.json({ success: true, tenants: formattedTenants });
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

app.post('/admin/tenants/:id/extend-trial', requireSuperAdmin, async (c) => {
  const id = c.req.param('id');
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';

  const body = await c.req.json<any>().catch(() => ({}));
  const days = Number(body.days) || 15;

  const tenant = await c.env.DB.prepare(`SELECT renewalDueDate, businessName FROM club_profiles WHERE id = ?`).bind(id).first<any>();
  if (!tenant) {
    return c.json({ success: false, error: 'Tenant not found' }, 404);
  }

  let baseDate = new Date();
  if (tenant.renewalDueDate) {
    const currentDue = new Date(tenant.renewalDueDate);
    if (!isNaN(currentDue.getTime()) && currentDue > baseDate) {
      baseDate = currentDue;
    }
  }
  baseDate.setDate(baseDate.getDate() + days);
  const newRenewalDueDate = baseDate.toISOString().split('T')[0];

  await c.env.DB.prepare(`
    UPDATE club_profiles 
    SET tenantStatus = 'ACTIVE', renewalDueDate = ? 
    WHERE id = ?
  `).bind(newRenewalDueDate, id).run();

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'EXTEND_TRIAL',
    adminEmail,
    id,
    tenant.businessName || 'Club',
    'info',
    JSON.stringify({ addedDays: days, newRenewalDueDate }),
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true, newRenewalDueDate });
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

  const body = await c.req.json<any>();
  const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const status = body?.status;

  if (!status || !allowedStatuses.includes(status)) {
    return c.json({ success: false, error: 'Invalid ticket status' }, 400);
  }

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

// GET /admin/analytics-reports
app.get('/admin/analytics-reports', requireSuperAdmin, async (c) => {
  const { results: clubs } = await c.env.DB.prepare(`SELECT * FROM club_profiles`).all<any>();
  const { results: bills } = await c.env.DB.prepare(`SELECT grandTotal, timestamp, status FROM bills LIMIT 1000`).all<any>();
  const { results: orders } = await c.env.DB.prepare(`SELECT orderAmount, paymentStatus, createdAt FROM razorpay_orders LIMIT 500`).all<any>();

  const totalTenants = clubs?.length || 0;
  const activeTenants = (clubs || []).filter((cl: any) => cl.tenantStatus === 'ACTIVE').length;
  const totalBillRevenue = (bills || []).reduce((acc: number, b: any) => acc + (Number(b.grandTotal) || 0), 0);
  const totalSubscriptionRevenue = (orders || []).filter((o: any) => o.paymentStatus === 'PAID' || o.paymentStatus === 'COMPLETED').reduce((acc: number, o: any) => acc + (Number(o.orderAmount) || 0), 0);

  const reports = [
    {
      id: 'rpt_overview',
      name: 'Platform Overview',
      totalTenants,
      activeTenants,
      totalBillRevenue,
      totalSubscriptionRevenue,
      totalBillsCount: bills?.length || 0,
      generatedAt: new Date().toISOString()
    }
  ];

  return c.json({ success: true, reports });
});

// Broadcast Management
app.get('/admin/broadcast', requireSuperAdmin, async (c) => {
  const row = await c.env.DB.prepare(`SELECT value FROM platform_settings WHERE key = 'active_broadcast'`).first<{ value: string }>();
  return c.json({ success: true, broadcast: row?.value ? JSON.parse(row.value) : null });
});

app.post('/admin/broadcast', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const body = await c.req.json<any>();

  const valueStr = JSON.stringify(body);
  const timestamp = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO platform_settings (key, value, updatedAt)
    VALUES ('active_broadcast', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
  `).bind(valueStr, timestamp).run();

  const logId = `aud_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'BROADCAST_SET',
    adminEmail,
    'GLOBAL',
    'Platform Broadcast',
    'info',
    valueStr,
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true });
});

app.delete('/admin/broadcast', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const timestamp = new Date().toISOString();

  await c.env.DB.prepare(`DELETE FROM platform_settings WHERE key = 'active_broadcast'`).run();

  const logId = `aud_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'BROADCAST_CLEARED',
    adminEmail,
    'GLOBAL',
    'Platform Broadcast',
    'info',
    JSON.stringify({ action: 'cleared' }),
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true });
});

// Promo Codes
app.get('/admin/promo-codes', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM promo_codes ORDER BY createdAt DESC`).all();
  return c.json({ success: true, promoCodes: results || [] });
});

app.post('/admin/promo-codes', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const body = await c.req.json<any>();

  const code = (body.code || '').trim().toUpperCase();
  const discountPercent = Number(body.discountPercent);
  const maxUses = Number(body.maxUses) || 50;
  const validUntil = body.validUntil || null;

  if (!code || isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return c.json({ success: false, error: 'Valid code and discount percent (0-100) are required' }, 400);
  }

  const existing = await c.env.DB.prepare(`SELECT id FROM promo_codes WHERE UPPER(code) = ?`).bind(code).first();
  if (existing) {
    return c.json({ success: false, error: 'Promo code already exists' }, 400);
  }

  const id = `promo_${Date.now()}`;
  const createdAt = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO promo_codes (id, code, discountPercent, validUntil, usesCount, maxUses, createdAt)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).bind(id, code, discountPercent, validUntil, maxUses, createdAt).run();

  const logId = `aud_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'PROMO_CODE_CREATED',
    adminEmail,
    'GLOBAL',
    'Platform Promo Code',
    'info',
    JSON.stringify({ promoId: id, code, discountPercent, maxUses }),
    createdAt
  ).run().catch(() => {});

  return c.json({ success: true, id });
});

app.delete('/admin/promo-codes/:id', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const id = c.req.param('id');

  await c.env.DB.prepare(`DELETE FROM promo_codes WHERE id = ?`).bind(id).run();

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'PROMO_CODE_DELETED',
    adminEmail,
    'GLOBAL',
    'Platform Promo Code',
    'info',
    JSON.stringify({ promoId: id }),
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true });
});

// Razorpay Orders
app.get('/admin/razorpay-orders', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM razorpay_orders ORDER BY createdAt DESC LIMIT 200`).all();
  return c.json({ success: true, orders: results || [] });
});

// Platform Team Members
app.get('/admin/team', requireSuperAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM team ORDER BY invitedAt DESC`).all();
  return c.json({ success: true, team: results || [] });
});

app.post('/admin/team', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const body = await c.req.json<any>();

  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const role = (body.role || 'Support Admin').trim();

  if (!name || !email) {
    return c.json({ success: false, error: 'Name and email are required' }, 400);
  }

  const id = `team_${Date.now()}`;
  const invitedAt = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO team (id, name, email, role, invitedAt, status)
    VALUES (?, ?, ?, ?, ?, 'ACTIVE')
  `).bind(id, name, email, role, invitedAt).run();

  const logId = `aud_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'TEAM_MEMBER_INVITED',
    adminEmail,
    id,
    name,
    'info',
    JSON.stringify({ teamMemberId: id, email, role }),
    invitedAt
  ).run().catch(() => {});

  return c.json({ success: true, id });
});

// Audit Log Writing
app.post('/admin/audit_logs', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const body = await c.req.json<any>();

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp, performedBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    body.action || 'ADMIN_ACTION',
    adminEmail,
    body.targetTenantId || null,
    body.targetClubName || null,
    body.severity || 'info',
    typeof body.metadata === 'string' ? body.metadata : JSON.stringify(body.metadata || {}),
    timestamp,
    adminEmail
  ).run();

  return c.json({ success: true, id: logId });
});

// Subscription Plans
app.post('/admin/subscription-plans', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const body = await c.req.json<any>();

  const id = (body.id || '').trim();
  const name = (body.name || '').trim();
  const amount = Number(body.amount);
  const periodMonths = Number(body.periodMonths) || 1;
  const discountLabel = body.discountLabel || null;

  if (!id || !name || isNaN(amount)) {
    return c.json({ success: false, error: 'id, name, and valid amount are required' }, 400);
  }

  const updatedAt = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO subscription_plans (id, name, amount, periodMonths, discountLabel, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET 
      name = excluded.name, 
      amount = excluded.amount, 
      periodMonths = excluded.periodMonths, 
      discountLabel = excluded.discountLabel, 
      updatedAt = excluded.updatedAt
  `).bind(id, name, amount, periodMonths, discountLabel, updatedAt).run();

  const logId = `aud_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'SUBSCRIPTION_PLAN_UPSERTED',
    adminEmail,
    'GLOBAL',
    name,
    'info',
    JSON.stringify({ planId: id, amount, periodMonths }),
    updatedAt
  ).run().catch(() => {});

  return c.json({ success: true });
});

// SuperAdmin Tenant Management
app.post('/admin/tenants', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const body = await c.req.json<any>();

  const id = body.id || `club_${Date.now()}`;
  const businessName = (body.businessName || 'Unnamed Club').trim();
  const ownerName = (body.ownerName || 'Club Owner').trim();
  const email = body.email || null;
  const whatsapp = body.whatsapp || '';
  const pincode = body.pincode || '';
  const city = body.city || 'India';
  const state = body.state || '';
  const upiId = body.upiId || '';
  const tenantStatus = body.tenantStatus || body.status || 'ACTIVE';
  const monthlyPlanFee = Number(body.monthlyPlanFee) || 499;
  const renewalDueDate = body.renewalDueDate || body.subscriptionDueDate || '2026-10-15';
  const activeTableCount = Number(body.activeTableCount || body.activeAssetsCount) || 4;

  await c.env.DB.prepare(`
    INSERT INTO club_profiles (
      id, businessName, ownerName, email, whatsapp, pincode, city, state, upiId,
      tenantStatus, monthlyPlanFee, renewalDueDate, totalRevenueThisMonth, activeTableCount, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).bind(
    id, businessName, ownerName, email, whatsapp, pincode, city, state, upiId,
    tenantStatus, monthlyPlanFee, renewalDueDate, activeTableCount, new Date().toISOString()
  ).run();

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'TENANT_CREATED',
    adminEmail,
    id,
    businessName,
    'success',
    JSON.stringify({ tenantId: id, businessName, ownerName }),
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true, tenantId: id });
});

app.put('/admin/tenants/:id', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const id = c.req.param('id');
  const body = await c.req.json<any>();

  await c.env.DB.prepare(`
    UPDATE club_profiles
    SET businessName = COALESCE(?, businessName),
        ownerName = COALESCE(?, ownerName),
        email = COALESCE(?, email),
        whatsapp = COALESCE(?, whatsapp),
        pincode = COALESCE(?, pincode),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        upiId = COALESCE(?, upiId),
        tenantStatus = COALESCE(?, tenantStatus),
        renewalDueDate = COALESCE(?, renewalDueDate),
        activeTableCount = COALESCE(?, activeTableCount)
    WHERE id = ?
  `).bind(
    body.businessName || null,
    body.ownerName || null,
    body.email || null,
    body.whatsapp || null,
    body.pincode || null,
    body.city || null,
    body.state || null,
    body.upiId || null,
    body.tenantStatus || body.status || null,
    body.renewalDueDate || body.subscriptionDueDate || null,
    body.activeTableCount || body.activeAssetsCount ? Number(body.activeTableCount || body.activeAssetsCount) : null,
    id
  ).run();

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'TENANT_UPDATED',
    adminEmail,
    id,
    body.businessName || 'Club',
    'info',
    JSON.stringify(body),
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true });
});

app.delete('/admin/tenants/:id', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const id = c.req.param('id');

  await c.env.DB.prepare(`UPDATE club_profiles SET tenantStatus = 'ARCHIVED' WHERE id = ?`).bind(id).run();

  const logId = `aud_${Date.now()}`;
  const timestamp = new Date().toISOString();
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'TENANT_ARCHIVED',
    adminEmail,
    id,
    'Archived Tenant',
    'warning',
    JSON.stringify({ tenantId: id }),
    timestamp
  ).run().catch(() => {});

  return c.json({ success: true });
});

app.post('/admin/tenants/:id/create-retainer-ticket', requireSuperAdmin, async (c) => {
  const adminUser = c.get('jwtPayload' as any) as any;
  const adminEmail = adminUser?.email || 'unknown-admin@justclub.in';
  const id = c.req.param('id');
  const body = await c.req.json<any>().catch(() => ({}));

  const club = await c.env.DB.prepare(`SELECT businessName FROM club_profiles WHERE id = ?`).bind(id).first<{ businessName: string }>();
  const clubName = club?.businessName || 'Club Tenant';

  const ticketId = `tkt_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const subject = body.subject || `Retainer Service Engagement - ${clubName}`;
  const category = body.category || 'RETAINER';
  const priority = body.priority || 'MEDIUM';
  const description = body.description || `Retainer ticket generated for ${clubName}. SuperAdmin assigned.`;

  await c.env.DB.prepare(`
    INSERT INTO support_tickets (id, clubId, clubName, subject, category, priority, status, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
  `).bind(ticketId, id, clubName, subject, category, priority, description, createdAt).run();

  const logId = `aud_${Date.now()}`;
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, action, adminEmail, targetTenantId, targetClubName, severity, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    logId,
    'RETAINER_TICKET_CREATED',
    adminEmail,
    id,
    clubName,
    'info',
    JSON.stringify({ ticketId, subject, category }),
    createdAt
  ).run().catch(() => {});

  return c.json({ success: true, ticketId });
});

app.get('/admin/telemetry', requireSuperAdmin, async (c) => {
  return c.json({
    success: true,
    timestamp: new Date().toISOString(),
    runtime: 'Cloudflare Workers / Pages',
    status: 'HEALTHY'
  });
});

export const onRequest = handle(app);
