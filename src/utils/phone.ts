/**
 * Phone and WhatsApp utility functions for JustClub OS
 * Standardizes all mobile phone numbers to 10-digit Indian WhatsApp numbers (+91).
 */

/**
 * Sanitizes input to extract a clean 10-digit Indian mobile number.
 * Handles inputs like "+91 98765 43210", "919876543210", "09876543210", etc.
 */
export function sanitize10DigitMobile(value: string | undefined | null): string {
  if (!value) return '';
  let digits = value.replace(/[^0-9]/g, '');

  // Strip international Indian prefix 91 if full 12-digit number provided
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // Strip leading 0 if 11-digit STD/trunk format
    digits = digits.slice(1);
  }

  // Cap at 10 digits
  return digits.slice(0, 10);
}

/**
 * Formats a phone number for UI display with the "+91" prefix.
 * e.g. "9876543210" -> "+91 98765 43210"
 */
export function formatWhatsAppDisplay(phone: string | undefined | null): string {
  if (!phone) return '';
  const clean = sanitize10DigitMobile(phone);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  // Fallback for partial/different lengths
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    const raw10 = digits.slice(2);
    return `+91 ${raw10.slice(0, 5)} ${raw10.slice(5)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone.startsWith('+') ? phone : `+91 ${phone}`;
}

/**
 * Formats a phone number for WhatsApp direct URLs (wa.me/XXXXXXXXXXXX).
 * Guarantees a single "91" country code without duplicates.
 */
export function formatWhatsAppForLink(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}
