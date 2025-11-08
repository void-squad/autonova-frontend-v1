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
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      // If we have both tokens and stored user info, restore session
      if (token && refreshToken && storedUserInfo) {
        try {
          // First try to use stored user info to avoid unnecessary API call
          const storedUser = JSON.parse(storedUserInfo);
          setUser(storedUser);

          // Then verify token in background and refresh if needed
          try {
            const currentUser = await authService.getUserInfo();
            // Update with fresh data if different
            if (JSON.stringify(currentUser) !== JSON.stringify(storedUser)) {
              setUser(currentUser);
              localStorage.setItem('userInfo', JSON.stringify(currentUser));
            }
          } catch (verifyError: any) {
            // If verification fails, try refresh token
            if (verifyError.message !== 'Session expired') {
              try {
                await authService.refreshAccessToken();
                const currentUser = await authService.getUserInfo();
                setUser(currentUser);
                localStorage.setItem('userInfo', JSON.stringify(currentUser));
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Only clear on refresh failure (refresh token expired)
                if (refreshError instanceof Error && refreshError.message === 'Session expired') {
                  localStorage.clear();
                  setUser(null);
                }
              }
            } else {
              // Session expired message means refresh already failed
              localStorage.clear();
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Only clear if JSON parsing fails (corrupted data)
          localStorage.clear();
          setUser(null);
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
