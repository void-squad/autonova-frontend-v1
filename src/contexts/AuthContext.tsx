import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import * as authService from '@/services/authService';
import type { AuthUser } from '@/types';
import type { MessageResponse } from '@/services/authService';

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
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  signup: (data: SignupData) => Promise<MessageResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getStoredUser()
  );
  const [loading, setLoading] = useState(true);

  // Auto-refresh token before expiration (every 50 minutes if token expires in 1 hour)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing token...');
        await authService.refreshAccessToken();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        // If refresh fails, user will be logged out on next API call
        if (error instanceof Error && error.message === 'Session expired') {
          localStorage.clear();
          setUser(null);
          window.location.href = '/login';
        }
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

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
    const loggedInUser = await authService.login(
      credentials.email,
      credentials.password
    );
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (data: SignupData) => {
    return authService.register({
      userName: data.userName,
      email: data.email,
      password: data.password,
      contactOne: data.contactNumber,
      role: data.role,
    });
  };

  const logout = async () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      ) as Partial<AuthUser>;

      if (Object.keys(filteredUpdates).length === 0) {
        return prev;
      }

      const nextUser = { ...prev, ...filteredUpdates };
      authService.storeUser(nextUser);
      return nextUser;
    });
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
        updateUser,
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
