import { UserAccount, UserActivityLog, Order } from '../types';
import { hashPassword } from './auth';
import { db } from './storage';

const STORAGE_KEYS = {
  USERS: 'surat_customer_users',
  SESSION: 'surat_customer_session',
  ACTIVITIES: 'surat_customer_activities'
};

interface CustomerSession {
  user: UserAccount;
  token: string;
  remember30Days: boolean;
  expiresAt: number;
}

export const REFERRAL_OPTIONS = [
  'Google Search / Penelusuran Web',
  'Instagram (@surat)',
  'TikTok',
  'Teman / Keluarga',
  'Iklan Facebook / Instagram Ads',
  'Rekomendasi Wedding Organizer (WO)',
  'Twitter / X',
  'Lainnya'
];

class CustomerAuthService {
  // In-memory fallback cache
  private cachedSession: CustomerSession | null = null;

  public getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to get users:', e);
    }
    return [];
  }

  public saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  public getSession(): CustomerSession | null {
    try {
      const sessionStr = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SESSION) : null;
      if (!sessionStr) {
        this.cachedSession = null;
        return null;
      }

      const session: CustomerSession = JSON.parse(sessionStr);

      if (!session || !session.user || typeof session !== 'object') {
        this.cachedSession = null;
        return null;
      }

      // Safe expiration validation (default to 30 days if not set or invalid)
      const expiresAt = typeof session.expiresAt === 'number' && !isNaN(session.expiresAt) && session.expiresAt > 0
        ? session.expiresAt
        : Date.now() + 30 * 24 * 60 * 60 * 1000;

      if (Date.now() > expiresAt) {
        // Session expired - clear silently without circular recursion
        try {
          localStorage.removeItem(STORAGE_KEYS.SESSION);
        } catch {}
        this.cachedSession = null;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('surat:auth-changed', { detail: null }));
        }
        return null;
      }

      this.cachedSession = session;
      return session;
    } catch (e) {
      return this.cachedSession;
    }
  }

  public getCurrentUser(): UserAccount | null {
    const session = this.getSession();
    if (!session || !session.user) return null;

    try {
      // Refresh from users storage to have latest profile data
      const users = this.getUsers();
      const freshUser = users.find(
        u => u.id === session.user.id || (u.email && session.user.email && u.email.toLowerCase() === session.user.email.toLowerCase())
      );
      if (freshUser) {
        // Synchronize session user if data has evolved
        if (session.user.name !== freshUser.name || session.user.phone !== freshUser.phone || session.user.username !== freshUser.username) {
          session.user = freshUser;
          this.persistSession(session);
        }
        return freshUser;
      }
    } catch (e) {
      console.error('Error refreshing current user profile:', e);
    }

    return session.user;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public register(params: {
    username: string;
    phone: string;
    email: string;
    password: string;
    referralSource?: string;
  }): { success: boolean; message: string; user?: UserAccount } {
    const cleanUsername = (params.username || '').trim();
    const cleanPhone = (params.phone || '').trim();
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanPassword = (params.password || '').trim();

    if (!cleanUsername || !cleanPhone || !cleanEmail || !cleanPassword) {
      return { success: false, message: 'Semua kolom bertanda bintang (*) wajib diisi.' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, message: 'Password minimal terdiri dari 6 karakter.' };
    }

    const users = this.getUsers();

    // Check if email already registered
    const existingEmailUser = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existingEmailUser) {
      return { 
        success: false, 
        message: 'Email sudah terdaftar. Silakan pilih menu "Masuk / Login" untuk mengakses akun Anda.' 
      };
    }

    // Check if username already used
    const existingUsername = users.find(
      u => u.username && u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (existingUsername) {
      return { 
        success: false, 
        message: 'Nama pengguna ini sudah digunakan. Silakan gunakan nama pengguna lain.' 
      };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      name: cleanUsername,
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash: hashPassword(cleanPassword),
      referralSource: params.referralSource?.trim() || 'Langsung Kunjungi Web',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto login for 30 days on registration
    this.createSession(newUser, true);

    // Dispatch auth state change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('surat:auth-changed', { detail: newUser }));
    }

    // Log Activity
    this.logActivity(
      newUser.id,
      newUser.email,
      'Registrasi Akun Baru',
      `Akun berhasil dibuat dengan nama pengguna ${newUser.username} (${newUser.email}).`,
      'UserPlus'
    );

    return { success: true, message: 'Registrasi berhasil! Anda otomatis masuk.', user: newUser };
  }

  public login(
    identifier: string,
    password: string,
    remember30Days: boolean = true
  ): { success: boolean; message: string; user?: UserAccount } {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Silakan isi email/nama pengguna dan password Anda.' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(
      u => (u.email && u.email.toLowerCase() === cleanId) || 
           (u.username && u.username.toLowerCase() === cleanId)
    );

    if (userIndex === -1) {
      return { success: false, message: 'Akun dengan email atau nama pengguna tersebut tidak ditemukan.' };
    }

    const user = users[userIndex];
    const expectedHash = hashPassword(cleanPass);
    const storedHash = typeof user.passwordHash === 'string' ? user.passwordHash : '';

    // Check if storedHash was corrupted/empty (due to earlier Promise stringify issue)
    const isCorrupted = !storedHash || storedHash === '{}' || storedHash === '[object Object]' || storedHash === '[object Promise]' || storedHash.length < 5;

    // Verify password: match hash OR plain password OR auto-heal if previously corrupted
    const isPasswordValid = storedHash === expectedHash || storedHash === cleanPass || isCorrupted;

    if (!isPasswordValid) {
      return { success: false, message: 'Password yang Anda masukkan salah. Silakan periksa kembali.' };
    }

    // Auto-heal passwordHash to modern standard
    user.passwordHash = expectedHash;
    user.lastLoginAt = new Date().toISOString();
    users[userIndex] = user;
    this.saveUsers(users);

    this.createSession(user, remember30Days);

    // Dispatch auth state change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('surat:auth-changed', { detail: user }));
    }

    // Log Activity
    this.logActivity(
      user.id,
      user.email,
      'Login ke Akun',
      `Berhasil masuk ke akun${remember30Days ? ' (Ingat Saya 30 Hari Aktif)' : ''}.`,
      'LogIn'
    );

    return { success: true, message: 'Login berhasil!', user };
  }

  public getUserByEmail(email: string): UserAccount | null {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => u.email && u.email.toLowerCase() === clean) || null;
  }

  public getUserById(id: string): UserAccount | null {
    if (!id) return null;
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  private persistSession(session: CustomerSession): void {
    try {
      this.cachedSession = session;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to persist session:', e);
    }
  }

  private createSession(user: UserAccount, remember30Days: boolean): void {
    // 30 days: 30 * 24 * 60 * 60 * 1000 ms; Otherwise 7 days minimum
    const durationMs = remember30Days
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    const session: CustomerSession = {
      user,
      token: `cust_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`,
      remember30Days,
      expiresAt: Date.now() + durationMs
    };

    this.persistSession(session);
  }

  public logout(): void {
    const session = this.cachedSession || this.getSession();
    const user = session?.user;

    if (user) {
      this.logActivity(user.id, user.email, 'Logout dari Akun', 'Pengguna keluar dari sesi akun.', 'LogOut');
    }

    this.cachedSession = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (e) {
      console.error('Failed to remove session item:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('surat:auth-changed', { detail: null }));
    }
  }

  public updateProfile(
    userId: string,
    data: { name?: string; phone?: string; username?: string; referralSource?: string }
  ): { success: boolean; message: string; user?: UserAccount } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    if (data.username && data.username.trim() && data.username.trim().toLowerCase() !== (users[index].username || '').toLowerCase()) {
      const duplicate = users.find(
        u => u.username && u.username.toLowerCase() === data.username?.trim().toLowerCase() && u.id !== userId
      );
      if (duplicate) {
        return { success: false, message: 'Nama pengguna ini sudah dipakai orang lain.' };
      }
      users[index].username = data.username.trim();
    }

    if (data.name !== undefined) users[index].name = data.name.trim();
    if (data.phone !== undefined) users[index].phone = data.phone.trim();
    if (data.referralSource !== undefined) users[index].referralSource = data.referralSource;

    this.saveUsers(users);

    // Update current session
    const session = this.getSession();
    if (session && session.user.id === userId) {
      session.user = users[index];
      this.persistSession(session);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('surat:auth-changed', { detail: users[index] }));
    }

    this.logActivity(
      userId,
      users[index].email,
      'Pembaruan Profil',
      'Data profil akun berhasil diperbarui.',
      'UserCheck'
    );

    return { success: true, message: 'Profil berhasil diperbarui!', user: users[index] };
  }

  public changePassword(
    userId: string,
    oldPass: string,
    newPass: string
  ): { success: boolean; message: string } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    const oldHash = hashPassword(oldPass.trim());
    const storedHash = users[index].passwordHash;
    const isCorrupted = !storedHash || storedHash === '{}' || storedHash === '[object Object]' || storedHash.length < 5;

    if (!isCorrupted && storedHash !== oldHash && storedHash !== oldPass.trim()) {
      return { success: false, message: 'Password lama yang Anda masukkan tidak sesuai.' };
    }

    if (newPass.trim().length < 6) {
      return { success: false, message: 'Password baru minimal terdiri dari 6 karakter.' };
    }

    users[index].passwordHash = hashPassword(newPass.trim());
    this.saveUsers(users);

    this.logActivity(
      userId,
      users[index].email,
      'Ganti Password',
      'Password akun berhasil diubah demi keamanan.',
      'Key'
    );

    return { success: true, message: 'Password berhasil diperbarui!' };
  }

  // --- Orders & Activities ---

  public getUserOrders(userId: string, userEmail: string): Order[] {
    const allOrders = db.getOrders();
    const cleanEmail = (userEmail || '').toLowerCase().trim();

    return allOrders.filter(o => {
      if (userId && o.userId && o.userId === userId) return true;
      if (cleanEmail && o.email && o.email.toLowerCase().trim() === cleanEmail) return true;
      return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getUserActivities(userId: string): UserActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (!data) return [];
      const logs: UserActivityLog[] = JSON.parse(data);
      return logs
        .filter(l => l.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      return [];
    }
  }

  public logActivity(
    userId: string,
    userEmail: string,
    action: string,
    details: string,
    icon: string = 'Activity'
  ): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      const logs: UserActivityLog[] = data ? JSON.parse(data) : [];

      const newLog: UserActivityLog = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        userEmail,
        action,
        details,
        timestamp: new Date().toISOString(),
        icon
      };

      logs.unshift(newLog);
      // Keep last 300 activities
      if (logs.length > 300) logs.length = 300;

      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to log customer activity:', e);
    }
  }
}

export const customerAuth = new CustomerAuthService();

