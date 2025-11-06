import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '@/services/authService';

interface User {
  id: number;
  email: string;
  userName: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const currentUser = await authService.getUserInfo();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Clear invalid tokens
          localStorage.clear();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials.email, credentials.password);
    setUser(response.userInfo);
  };

  const signup = async (data: SignupData) => {
    // Register the user
    await authService.register({
      userName: data.userName,
      email: data.email,
      password: data.password,
      contactOne: data.contactNumber,
      role: data.role
    });
    // Note: After registration, user needs to login separately
    // The backend doesn't auto-login after registration
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
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
