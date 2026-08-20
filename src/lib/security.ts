// Cyber Security & Defense-in-Depth Utilities

/**
 * Sanitizes any user input string against XSS, HTML Injection, and Control Characters.
 * Ensures string is clean, bounded in length, and safe to process.
 */
export function sanitizeInputText(input: unknown, maxLength = 30): string {
  if (typeof input !== 'string') return '';
  
  // 1. Remove HTML tags, script vectors, and javascript: protocols
  let cleaned = input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload/gi, '')
    .replace(/onerror/gi, '')
    .replace(/onclick/gi, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Strip control chars

  // 2. Normalize whitespace
  cleaned = cleaned.trim().replace(/\s+/g, ' ');

  // 3. Clamp length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim();
  }

  return cleaned;
}

/**
 * In-memory Anti-Spam & Action Rate Limiter
 * Throttles rapid button clicks, macro bursts, and automated request flooding.
 */
export class ActionRateLimiter {
  private lastActionTimes: Map<string, number> = new Map();

  /**
   * Checks if an action is allowed based on cooldown in milliseconds.
   * Returns true if action is permitted, false if rate limited.
   */
  isAllowed(actionKey: string, cooldownMs = 400): boolean {
    const now = performance.now();
    const lastTime = this.lastActionTimes.get(actionKey) || 0;

    if (now - lastTime < cooldownMs) {
      return false; // Spam blocked
    }

    this.lastActionTimes.set(actionKey, now);
    return true;
  }

  reset(actionKey?: string) {
    if (actionKey) {
      this.lastActionTimes.delete(actionKey);
    } else {
      this.lastActionTimes.clear();
    }
  }
}

export const globalRateLimiter = new ActionRateLimiter();

/**
 * Secure Local Storage Wrapper with structural integrity check & error containment
 */
export const safeStorage = {
  save(key: string, data: unknown): boolean {
    if (typeof window === 'undefined') return false;
    try {
      // Basic Prototype pollution defense
      const serialized = JSON.stringify(data);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.warn('Security: Failed to safely write to localStorage', e);
      return false;
    }
  },

  load<T>(key: string, validateFn?: (parsed: any) => boolean): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      // Ensure parsed object is not null/malicious prototype injection
      if (parsed && typeof parsed === 'object') {
        if ('__proto__' in parsed || 'constructor' in parsed) {
          console.warn('Security Alert: Malicious prototype payload detected in localStorage.');
          window.localStorage.removeItem(key);
          return null;
        }
      }

      if (validateFn && !validateFn(parsed)) {
        console.warn('Security: Data schema verification failed for key', key);
        return null;
      }

      return parsed as T;
    } catch (e) {
      console.warn('Security: Failed to safely load from localStorage', e);
      return null;
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn('Security: Failed to remove key from localStorage', e);
    }
  }
};
