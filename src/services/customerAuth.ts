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
  private getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get users:', e);
    }
    return [];
  }

  private saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  }

  public getSession(): CustomerSession | null {
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!sessionStr) return null;
      const session: CustomerSession = JSON.parse(sessionStr);

      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  }

  public getCurrentUser(): UserAccount | null {
    const session = this.getSession();
    if (!session) return null;

    // Refresh from users db to have latest profile data
    const users = this.getUsers();
    const freshUser = users.find(u => u.id === session.user.id);
    return freshUser || session.user;
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
    const cleanUsername = params.username.trim();
    const cleanPhone = params.phone.trim();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPassword = params.password.trim();

    if (!cleanUsername || !cleanPhone || !cleanEmail || !cleanPassword) {
      return { success: false, message: 'Semua kolom wajib diisi!' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter!' };
    }

    const users = this.getUsers();

    // Check if email already registered
    const existingEmail = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' };
    }

    // Check if username already used
    const existingUsername = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (existingUsername) {
      return { success: false, message: 'Nama pengguna ini sudah digunakan. Silakan pilih nama pengguna lain.' };
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

    // Log Activity
    this.logActivity(
      newUser.id,
      newUser.email,
      'Registrasi Akun Baru',
      `Akun berhasil dibuat dengan nama pengguna ${newUser.username} (${newUser.email}).`,
      'UserPlus'
    );

    return { success: true, message: 'Registrasi berhasil!', user: newUser };
  }

  public login(
    identifier: string,
    password: string,
    remember30Days: boolean = true
  ): { success: boolean; message: string; user?: UserAccount } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Silakan isi email/nama pengguna dan password.' };
    }

    const users = this.getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'Akun dengan email/nama pengguna tersebut tidak ditemukan.' };
    }

    const hash = hashPassword(cleanPass);
    if (user.passwordHash !== hash) {
      return { success: false, message: 'Password yang Anda masukkan salah.' };
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);

    this.createSession(user, remember30Days);

    // Log Activity
    this.logActivity(
      user.id,
      user.email,
      'Login ke Akun',
      `Berhasil masuk ke akun${remember30Days ? ' (Ingat saya 30 hari aktif)' : ''}.`,
      'LogIn'
    );

    return { success: true, message: 'Login berhasil!', user };
  }

  private createSession(user: UserAccount, remember30Days: boolean): void {
    // 30 days: 30 * 24 * 60 * 60 * 1000 ms; Otherwise standard 1 day: 24 * 60 * 60 * 1000 ms
    const durationMs = remember30Days
      ? 30 * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const session: CustomerSession = {
      user,
      token: `cust_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`,
      remember30Days,
      expiresAt: Date.now() + durationMs
    };

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }

  public logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logActivity(user.id, user.email, 'Logout dari Akun', 'Pengguna keluar dari sesi akun.', 'LogOut');
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  public updateProfile(
    userId: string,
    data: { name?: string; phone?: string; username?: string; referralSource?: string }
  ): { success: boolean; message: string; user?: UserAccount } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    if (data.username && data.username !== users[index].username) {
      const duplicate = users.find(u => u.username.toLowerCase() === data.username?.toLowerCase() && u.id !== userId);
      if (duplicate) {
        return { success: false, message: 'Nama pengguna ini sudah dipakai orang lain.' };
      }
      users[index].username = data.username.trim();
    }

    if (data.name) users[index].name = data.name.trim();
    if (data.phone) users[index].phone = data.phone.trim();
    if (data.referralSource) users[index].referralSource = data.referralSource;

    this.saveUsers(users);

    // Update current session
    const session = this.getSession();
    if (session && session.user.id === userId) {
      session.user = users[index];
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
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
    if (users[index].passwordHash !== oldHash) {
      return { success: false, message: 'Password lama Anda tidak sesuai.' };
    }

    if (newPass.trim().length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' };
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
    const cleanEmail = userEmail.toLowerCase().trim();

    return allOrders.filter(o => {
      if (o.userId && o.userId === userId) return true;
      if (o.email && o.email.toLowerCase().trim() === cleanEmail) return true;
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
