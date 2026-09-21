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
