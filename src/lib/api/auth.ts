import { api, setAuthToken, clearAuthToken } from './client';

export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  role: string;
}

export interface LoginSuccess {
  token: string;
  type: string;
  user: AuthUser;
}

export const authApi = {
  async login(email: string, password: string) {
    const response = await api<LoginSuccess>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(response.token);
    return response;
  },

  async register(payload: Record<string, unknown>) {
    return api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout() {
    clearAuthToken();
  },
};
