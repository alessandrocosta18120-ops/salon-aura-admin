// Session management for salon admin
export interface SessionData {
  sessionId: string;
  salonId: string;
  userName?: string;
  userId?: string;
  slug?: string;
  role?: 'admin' | 'manager' | 'staff' | 'webmaster';
  // Impersonation: stores original webmaster session when impersonating
  originalSession?: Omit<SessionData, 'originalSession'>;
}

const SESSION_KEY = 'salon_admin_session';

export const sessionManager = {
  save(data: SessionData) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },

  get(): SessionData | null {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  getSalonId(): string | null {
    const session = this.get();
    return session?.salonId || null;
  },

  getSessionId(): string | null {
    const session = this.get();
    return session?.sessionId || null;
  },

  getUserId(): string | null {
    const session = this.get();
    return session?.userId || null;
  },

  getSlug(): string | null {
    const session = this.get();
    return session?.slug || null;
  },

  getRole(): 'admin' | 'manager' | 'staff' | 'webmaster' | null {
    const session = this.get();
    return session?.role || null;
  },

  clear() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return this.get() !== null;
  },

  // Impersonation: webmaster can act as another salon/user
  impersonate(targetSession: { sessionId: string; salonId: string; userName?: string; userId?: string; slug?: string; role?: 'admin' | 'manager' | 'staff' }) {
    const current = this.get();
    if (!current || current.role !== 'webmaster') return false;
    
    const originalSession = { ...current };
    delete (originalSession as any).originalSession;
    
    this.save({
      ...targetSession,
      originalSession,
    });
    return true;
  },

  // Exit impersonation and restore webmaster session
  exitImpersonation() {
    const current = this.get();
    if (!current?.originalSession) return false;
    
    this.save(current.originalSession as SessionData);
    return true;
  },

  isImpersonating(): boolean {
    const session = this.get();
    return !!session?.originalSession;
  },

  getOriginalRole(): 'admin' | 'manager' | 'staff' | 'webmaster' | null {
    const session = this.get();
    return session?.originalSession?.role || session?.role || null;
  }
};
