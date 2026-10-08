import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { fetchCurrentUser, loginUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Logic: Provides global authentication state management and token persistence.
 * Input: `children` (React.ReactNode).
 * Output: JSX.Element wrapping application with AuthContext.Provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('furaoj_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('furaoj_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await fetchCurrentUser();
          setUser(profile);
          localStorage.setItem('furaoj_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('furaoj_token');
          localStorage.removeItem('furaoj_user');
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (u: string, p: string) => {
    const res = await loginUser(u, p);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('furaoj_token', res.token);
    localStorage.setItem('furaoj_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('furaoj_token');
    localStorage.removeItem('furaoj_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Logic: Custom hook exposing authentication methods and current session state.
 * Input: None.
 * Output: AuthContextType containing active user, token, and auth dispatch actions.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
