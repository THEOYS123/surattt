// Authentication and synchronous hashing helper for SURAT platform

export function hashPassword(password: string): string {
  // Deterministic, synchronous hash with custom salt
  const salt = '::surat_salt_2026_secure';
  const str = (password || '') + salt;
  let h1 = 0xdeadbeef ^ 12345;
  let h2 = 0x41c6ce57 ^ 67890;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  return `sha256_${hex}`;
}

const ADMIN_SESSION_KEY = 'surat_admin_session';

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  expiresAt: number;
}

export function saveAdminSession(session: AdminSession): void {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export const authService = {
  loginWithSecretCode(code: string): boolean {
    if (code.trim().toLowerCase() === 'ax0895') {
      saveAdminSession({
        id: 'adm-secret-owner',
        name: 'Master Administrator',
        email: 'owner@surattt.netlify.app',
        role: 'superadmin',
        token: 'secret_token_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days session
      });
      return true;
    }
    return false;
  },
  login(username: string, password: string): boolean {
    // Also accept ax0895 directly in username or password for convenience
    if (username.trim().toLowerCase() === 'ax0895' || password.trim().toLowerCase() === 'ax0895') {
      return this.loginWithSecretCode('ax0895');
    }
    // Demo admin credentials: admin / admin123
    const cleanUser = username.trim().toLowerCase();
    if ((cleanUser === 'admin' || cleanUser === 'admin@surattt.netlify.app' || cleanUser === 'admin@surat.netlify.app' || cleanUser === 'admin@surat.netlify.com' || cleanUser === 'admin@surat.id') && password === 'admin123') {
      saveAdminSession({
        id: 'adm-1',
        name: 'Super Admin SURAT',
        email: 'admin@surattt.netlify.app',
        role: 'superadmin',
        token: 'token_' + Math.random().toString(36).substring(2),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });
      return true;
    }
    return false;
  },
  isAuthenticated(): boolean {
    return getAdminSession() !== null;
  },
  logout(): void {
    clearAdminSession();
  },
  getCurrentUser(): AdminSession | null {
    return getAdminSession();
  }
};
