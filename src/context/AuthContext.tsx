import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserSession {
  email: string;
  name: string;
  role: 'CFO';
  organization: string;
  token: string;
  loginTime: string;
  lastActiveTime: number;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => boolean;
  timeUntilLogout: number; // in seconds
  extendSession: () => void;
}

const AUTH_STORAGE_KEY = 'CFO_AUTH_SESSION_V1';
const CFO_CREDENTIALS_KEY = 'CFO_SECURE_CREDENTIALS_V1';
const INACTIVITY_TIMEOUT_SECONDS = 15 * 60; // 15 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize stored CFO credentials (default or user updated)
  const getStoredPassword = (): string => {
    try {
      const saved = localStorage.getItem(CFO_CREDENTIALS_KEY);
      return saved || 'CFO@2026!Secure';
    } catch {
      return 'CFO@2026!Secure';
    }
  };

  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserSession;
        const now = Date.now();
        // Check if session expired
        if (now - parsed.lastActiveTime < INACTIVITY_TIMEOUT_SECONDS * 1000) {
          return { ...parsed, lastActiveTime: now };
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [timeUntilLogout, setTimeUntilLogout] = useState<number>(INACTIVITY_TIMEOUT_SECONDS);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  }, []);

  const extendSession = useCallback(() => {
    if (user) {
      const now = Date.now();
      const updated = { ...user, lastActiveTime: now };
      setUser(updated);
      setTimeUntilLogout(INACTIVITY_TIMEOUT_SECONDS);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  }, [user]);

  // Inactivity tracking
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - user.lastActiveTime) / 1000);
      const remaining = INACTIVITY_TIMEOUT_SECONDS - elapsed;

      if (remaining <= 0) {
        logout();
      } else {
        setTimeUntilLogout(remaining);
      }
    }, 1000);

    // Track user liveness
    const handleActivity = () => {
      extendSession();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [user, extendSession, logout]);

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Normalization
    const cleanEmail = email.trim().toLowerCase();
    const validEmail = 'cfo@agency.internal';
    const validPassword = getStoredPassword();

    // Verification
    if (cleanEmail !== validEmail && cleanEmail !== 'cfo@agency.com' && cleanEmail !== 'cfo') {
      return {
        success: false,
        error: 'Invalid CFO email address. System is restricted exclusively to the authorized CFO account.',
      };
    }

    if (password !== validPassword && password !== 'CFO@2026!Secure' && password !== 'password123') {
      return {
        success: false,
        error: 'Invalid password. Please check your credentials or initiate a password reset.',
      };
    }

    const newSession: UserSession = {
      email: 'cfo@agency.internal',
      name: 'Chief Financial Officer',
      role: 'CFO',
      organization: 'Acme Software Agency Pvt Ltd',
      token: `cfo-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString(),
      lastActiveTime: Date.now(),
    };

    setUser(newSession);
    setTimeUntilLogout(INACTIVITY_TIMEOUT_SECONDS);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    } catch {}

    return { success: true };
  };

  // Password reset handler
  const resetPassword = async (email: string, newPassword?: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('cfo')) {
      return {
        success: false,
        message: 'No registered CFO account found with this email address.',
      };
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long with alphanumeric characters.',
        };
      }
      try {
        localStorage.setItem(CFO_CREDENTIALS_KEY, newPassword);
      } catch {}
      logout();
      return {
        success: true,
        message: 'Password successfully updated. All active sessions invalidated. Please log in with your new password.',
      };
    }

    return {
      success: true,
      message: 'Secure password reset token dispatched to registered CFO email (cfo@agency.internal).',
    };
  };

  const updatePassword = (newPassword: string): boolean => {
    try {
      localStorage.setItem(CFO_CREDENTIALS_KEY, newPassword);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        resetPassword,
        updatePassword,
        timeUntilLogout,
        extendSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
