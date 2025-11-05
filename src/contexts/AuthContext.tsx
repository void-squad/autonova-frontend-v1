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

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      if (!authService.isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      try {
        await authService.getProfile();
      } catch (error) {
        console.error('Failed to validate current session:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
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
