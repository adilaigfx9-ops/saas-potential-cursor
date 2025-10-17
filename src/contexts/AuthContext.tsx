import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Role } from '../user/types/index';
import { authService } from '../user/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = authService.getToken();

      if (savedToken) {
        try {
          const result = await authService.verifyToken(savedToken);
          if (result.success) {
            setToken(savedToken);
            setUser(result.user);
          } else {
            authService.removeToken();
          }
        } catch (error) {
          authService.removeToken();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    authService.saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    authService.removeToken();
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return !!user?.role && roles.includes(user.role);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isAdmin,
      }}
    >
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
