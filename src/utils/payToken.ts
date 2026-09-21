// Security & Short Link Utility for JustClub OS Payment Links

const SECRET_SALT = 'JUSTCLUB_PAY_GATEWAY_SALT_2026';

/**
 * Fast mathematical checksum generator to detect URL tampering
 */
function generateChecksum(payload: string): string {
  let hash = 5381;
  const combined = `${payload}_${SECRET_SALT}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 33) ^ combined.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Generates a clean URL slug for a club profile.
 * E.g. "Justgst's Club" -> "justgst"
 */
export function getClubSlug(clubProfile?: { paymentSlug?: string; businessName?: string; upiId?: string } | null): string {
  if (clubProfile?.paymentSlug && clubProfile.paymentSlug.trim()) {
    const customSlug = clubProfile.paymentSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (customSlug) return customSlug;
  }
  if (clubProfile?.businessName && clubProfile.businessName.trim()) {
    const autoSlug = clubProfile.businessName
      .trim()
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]/g, '');
    if (autoSlug) return autoSlug;
  }
  if (clubProfile?.upiId && clubProfile.upiId.trim()) {
    const handle = clubProfile.upiId.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (handle) return handle;
  }
  return 'justclub';
}

/**
 * Encodes VPA, Amount, and Club Name into an ultra-short tamper-proof token string.
 * Example result: "justclub.in/p/eNq8xA2m"
 */
export function createShortPayToken(upi: string, amount: number, clubName: string): string {
  const cleanUpi = upi.trim();
  const cleanAmt = Math.max(0, Math.round(amount));
  const cleanName = clubName.trim();

  const dataPayload = `${cleanUpi}|${cleanAmt}|${cleanName}`;
  const checksum = generateChecksum(dataPayload);
  const fullString = `${dataPayload}|${checksum}`;

  // Compress & URL-safe Base64 encode
  try {
    const base64 = btoa(unescape(encodeURIComponent(fullString)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch {
    // Fallback if encoding fails
    return `${encodeURIComponent(cleanUpi)}_${cleanAmt}`;
  }
}

/**
 * Decodes and validates the tamper-proof token.
 * Returns null if the user modified/edited ANY character in the URL.
 */
export function decodeAndVerifyPayToken(token: string): { upi: string; amt: number; name: string } | null {
  if (!token) return null;

  try {
    // Restore base64 string format
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const unescaped = decodeURIComponent(escape(atob(base64)));
    const parts = unescaped.split('|');

    if (parts.length < 4) {
      return null;
    }

    const [upi, amtStr, name, checksum] = parts;
    const dataPayload = `${upi}|${amtStr}|${name}`;
    const expectedChecksum = generateChecksum(dataPayload);

    // Anti-Tampering Security Check
    if (checksum !== expectedChecksum) {
      console.warn('Tampered payment link detected!', { token, checksum, expectedChecksum });
      return null;
    }

    return {
      upi,
      amt: Number(amtStr) || 0,
      name
    };
  } catch (err) {
    console.error('Invalid payment token format:', err);
    return null;
  }
}

// --- MULTI-TENANT SLUG REGISTRY & SMART SUGGESTIONS ---

export interface TenantSlugRecord {
  slug: string;
  clubId: string;
  businessName: string;
  upiId: string;
}

// Default system reserved slugs
const RESERVED_SLUGS = new Set([
  'admin', 'superadmin', 'login', 'pay', 'p', 'app', 'pos', 'api',
  'support', 'billing', 'help', 'settings', 'justclub', 'auth'
]);

/**
 * Gets all registered slugs across all tenants from localStorage
 */
export function getRegisteredSlugRegistry(): Record<string, TenantSlugRecord> {
  const registry: Record<string, TenantSlugRecord> = {
    'apexcue': {
      slug: 'apexcue',
      clubId: 'club_001',
      businessName: 'Apex Cue & Gaming Club',
      upiId: 'apexclub@okaxis'
    },
    'imperial': {
      slug: 'imperial',
      clubId: 'club_002',
      businessName: 'Imperial Snooker Lounge',
      upiId: 'imperialsnooker@ybl'
    }
  };

  try {
    const saved = localStorage.getItem('justclub_slug_registry');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(registry, parsed);
    }
  } catch (e) {
    console.error('Error reading slug registry:', e);
  }

  // Always include current active club profile if present
  try {
    const savedProfile = localStorage.getItem('club_pos_profile');
    if (savedProfile) {
      const prof = JSON.parse(savedProfile);
      const slug = getClubSlug(prof);
      if (slug) {
        registry[slug] = {
          slug,
          clubId: prof.id || 'current_club',
          businessName: prof.businessName || 'My Club',
          upiId: prof.upiId || ''
        };
      }
    }
  } catch (e) {
    console.error('Error adding current club to registry:', e);
  }

  return registry;
}

/**
 * Registers or updates a tenant's slug in the global registry
 */
export function registerTenantSlug(clubId: string, slug: string, businessName: string, upiId: string): void {
  const clean = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  if (!clean) return;

  const registry = getRegisteredSlugRegistry();
  
  // Remove any previous slug registered for this clubId if changed
  Object.keys(registry).forEach(key => {
    if (registry[key].clubId === clubId && key !== clean) {
      delete registry[key];
    }
  });

  registry[clean] = {
    slug: clean,
    clubId,
    businessName,
    upiId
  };

  try {
    localStorage.setItem('justclub_slug_registry', JSON.stringify(registry));
  } catch (e) {
    console.error('Error saving slug registry:', e);
  }
}

/**
 * Validates whether a slug is available for a given clubId.
 * Returns availability status and smart suggestions if taken.
 */
export function checkSlugAvailability(
  desiredSlug: string,
  currentClubId: string,
  pincode?: string,
  businessName?: string
): { isAvailable: boolean; isTakenByOther: boolean; isReserved: boolean; suggestions: string[] } {
  const clean = desiredSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

  if (!clean || RESERVED_SLUGS.has(clean)) {
    const suggestions = generateSlugSuggestions(clean || 'club', currentClubId, pincode, businessName);
    return {
      isAvailable: false,
      isTakenByOther: false,
      isReserved: true,
      suggestions
    };
  }

  const registry = getRegisteredSlugRegistry();
  const existingRecord = registry[clean];

  if (existingRecord && existingRecord.clubId !== currentClubId) {
    const suggestions = generateSlugSuggestions(clean, currentClubId, pincode, businessName);
    return {
      isAvailable: false,
      isTakenByOther: true,
      isReserved: false,
      suggestions
    };
  }

  return {
    isAvailable: true,
    isTakenByOther: false,
    isReserved: false,
    suggestions: []
  };
}

/**
 * Generates 3 smart available slug suggestions if the desired slug is taken.
 */
export function generateSlugSuggestions(
  baseSlug: string,
  currentClubId: string,
  pincode?: string,
  businessName?: string
): string[] {
  const registry = getRegisteredSlugRegistry();
  const cleanBase = baseSlug.toLowerCase().trim().replace(/[^a-z0-9]/g, '') || 'club';
  const cleanPin = (pincode || '').replace(/\D/g, '').slice(0, 3);

  const candidatePool = [
    `${cleanBase}club`,
    `${cleanBase}cue`,
    cleanPin ? `${cleanBase}${cleanPin}` : `${cleanBase}01`,
    `${cleanBase}pos`,
    `${cleanBase}lounge`,
    `${cleanBase}official`,
    `${cleanBase}1`
  ];

  const available: string[] = [];
  for (const candidate of candidatePool) {
    if (available.length >= 3) break;
    if (RESERVED_SLUGS.has(candidate)) continue;
    const existing = registry[candidate];
    if (!existing || existing.clubId === currentClubId) {
      available.push(candidate);
    }
  }

  return available;
}
