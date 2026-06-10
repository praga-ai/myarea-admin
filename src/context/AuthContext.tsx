import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  userId: number;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLoginDate: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, fullName: string, password: string, confirmPassword: string, roleId: number) => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo credentials (fallback when backend is unavailable)
    // Support both old (@survey.com) and new (@myarea.com) credentials
    const demoUsers: { [key: string]: { password: string; user: User } } = {
      // New MyArea credentials
      'admin@myarea.com': {
        password: 'Admin@123',
        user: {
          userId: 1,
          email: 'admin@myarea.com',
          fullName: 'Admin User',
          roleName: 'Admin',
          isActive: true,
          lastLoginDate: new Date().toISOString(),
        },
      },
      'surveyor@myarea.com': {
        password: 'Surveyor@123',
        user: {
          userId: 2,
          email: 'surveyor@myarea.com',
          fullName: 'Surveyor User',
          roleName: 'Surveyor',
          isActive: true,
          lastLoginDate: new Date().toISOString(),
        },
      },
      // Legacy credentials (for backward compatibility)
      'admin@survey.com': {
        password: 'Admin@123',
        user: {
          userId: 1,
          email: 'admin@survey.com',
          fullName: 'Admin User',
          roleName: 'Admin',
          isActive: true,
          lastLoginDate: new Date().toISOString(),
        },
      },
      'surveyor@survey.com': {
        password: 'Surveyor@123',
        user: {
          userId: 2,
          email: 'surveyor@survey.com',
          fullName: 'Surveyor User',
          roleName: 'Surveyor',
          isActive: true,
          lastLoginDate: new Date().toISOString(),
        },
      },
    };

    // Try API first, fall back to demo credentials
    try {
      const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        return;
      }
    } catch (e) {
      // API not available, fall back to demo
    }

    // Fall back to demo credentials
    const demoUser = demoUsers[email];
    if (demoUser && demoUser.password === password) {
      const token = 'demo-token-' + Date.now();
      setToken(token);
      setUser(demoUser.user);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(demoUser.user));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (email: string, fullName: string, password: string, confirmPassword: string, roleId: number) => {
    const response = await fetch('https://func-mobileapp-cs-in.azurewebsites.net/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, password, confirmPassword, roleId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    // Auto-login after registration
    setUser(data.user);
    // Note: Registration doesn't return a token, user needs to login
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const hasRole = (roleName: string) => {
    return user?.roleName === roleName;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!token && !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
