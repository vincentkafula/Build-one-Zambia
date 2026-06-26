/**
 * Frontend Security & Input Sanitization
 * Protects against XSS, injection attacks, and malicious inputs
 * across all forms on the Build One Zambia platform.
 */

// ── XSS / Injection Prevention ────────────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,           // onclick=, onload=, etc.
  /data\s*:\s*text\/html/gi,
  /vbscript\s*:/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /expression\s*\(/gi,    // CSS expression()
  /<!--[\s\S]*?-->/g,     // HTML comments that could hide payloads
];

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE)\b)/gi,
  /(-{2}|\/\*|\*\/)/g,   // SQL comments
  /;\s*(DROP|DELETE|INSERT|UPDATE)/gi,
  /'\s*(OR|AND)\s+'?\d+'?\s*=\s*'?\d+/gi, // ' OR '1'='1
];

/** Strip HTML tags and dangerous patterns from a string */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let clean = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  return clean.trim();
}

/** Sanitize but allow plain text (no HTML encoding — for names, addresses etc.) */
export function sanitizePlainText(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim();

  // Remove null bytes and control characters
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Block obvious injection attempts
  for (const pattern of [...DANGEROUS_PATTERNS, ...SQL_PATTERNS]) {
    if (pattern.test(clean)) return '';
  }

  return clean.slice(0, maxLength);
}

/** Sanitize a phone number — digits, +, spaces, hyphens only */
export function sanitizePhone(input: string): string {
  return input.replace(/[^\d\s\+\-\(\)]/g, '').trim().slice(0, 20);
}

/** Sanitize an email address */
export function sanitizeEmail(input: string): string {
  return input.replace(/[^a-zA-Z0-9@._\-+]/g, '').toLowerCase().trim().slice(0, 254);
}

/** Sanitize a numeric string — digits only */
export function sanitizeNumeric(input: string): string {
  return input.replace(/[^\d]/g, '').slice(0, 20);
}

/** Validate and sanitize NRC ID (Zambia format: XXXXXX/XX/X) */
export function sanitizeNRC(input: string): string {
  return input.replace(/[^\d\/]/g, '').trim().slice(0, 15);
}

/** Check if a string contains dangerous content — returns true if safe */
export function isSafe(input: string): boolean {
  if (!input) return true;
  for (const pattern of [...DANGEROUS_PATTERNS, ...SQL_PATTERNS]) {
    if (pattern.test(input)) return false;
  }
  return true;
}

// ── Session Security ──────────────────────────────────────────────────────────

const SESSION_CREATED_KEY = 'boz_session_created';
const SESSION_MAX_AGE_MS   = 8 * 60 * 60 * 1000; // 8 hours

/** Mark session start time */
export function markSessionStart(): void {
  sessionStorage.setItem(SESSION_CREATED_KEY, String(Date.now()));
}

/** Check if the current session has expired — auto-logout if so */
export function isSessionExpired(): boolean {
  const created = sessionStorage.getItem(SESSION_CREATED_KEY);
  if (!created) return false;
  return Date.now() - Number(created) > SESSION_MAX_AGE_MS;
}

/** Clear all session data (call on logout or expiry) */
export function clearSession(): void {
  sessionStorage.clear();
}

// ── Clipboard Protection ──────────────────────────────────────────────────────

/** Prevent sensitive fields from being copied to clipboard in production */
export function preventCopy(e: ClipboardEvent): void {
  if (import.meta.env.PROD) {
    e.preventDefault();
  }
}

// ── Bot / Automation Detection ────────────────────────────────────────────────

/**
 * Honeypot field check — if a hidden field has been filled, it's a bot.
 * Usage: Add <input name="website" style={{display:'none'}} /> to forms,
 * then check isBot(formData.website) before submitting.
 */
export function isBot(honeypotValue: string): boolean {
  return honeypotValue.length > 0;
}

/** Detect suspiciously fast form completion (< 3 seconds = likely a bot) */
export function isTooFast(formStartTime: number): boolean {
  return Date.now() - formStartTime < 3000;
}

// ── Payload Validation ────────────────────────────────────────────────────────

/** Validate a complete form payload — returns list of field errors */
export function validatePayload(
  payload: Record<string, unknown>,
  rules: Record<string, { required?: boolean; maxLength?: number; pattern?: RegExp; label?: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = String(payload[field] ?? '').trim();
    const label = rule.label ?? field;

    if (rule.required && !value) {
      errors[field] = `${label} is required.`;
      continue;
    }
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${label} must be ${rule.maxLength} characters or fewer.`;
      continue;
    }
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = `${label} format is invalid.`;
      continue;
    }
    if (value && !isSafe(value)) {
      errors[field] = `${label} contains invalid characters.`;
    }
  }

  return errors;
}
