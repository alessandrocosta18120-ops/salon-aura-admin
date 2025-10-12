// Session management for salon admin
export interface SessionData {
  sessionId: string;
  salonId: string;
  userName?: string;
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

  clear() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return this.get() !== null;
  }
};
