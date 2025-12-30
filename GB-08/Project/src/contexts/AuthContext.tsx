import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAuthToken } from '../lib/api';

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Try to restore session from localStorage token or cookie
    const token = localStorage.getItem('intervuiq_token');
    if (token) {
      setAuthToken(token);
    }

    // Fetch current user (backend will read cookie or Authorization header)
    (async () => {
      try {
        const res = await api.get('/api/users/me');
        if (res?.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Not authenticated or session expired — keep anonymous
        setUser(null);
        setIsAuthenticated(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      const res = await api.post('/api/users/login', { email, password });
      const { token, user: userData } = res.data;

      if (token) {
        // set header for subsequent requests
        setAuthToken(token);
        if (remember) localStorage.setItem('intervuiq_token', token);
      }

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // rethrow so UI can show toast
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role?: string) => {
    try {
      const res = await api.post('/api/users/register', { name, email, password, role });
      // backend sets cookie and returns created user
      if (res?.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        // attempt to immediately log the user in (backend login returns token)
        try {
          await login(email, password, true);
        } catch (err) {
          // ignore login error here; user is still registered
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/users/logout');
    } catch (err) {
      // ignore network errors on logout
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('intervuiq_token');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
