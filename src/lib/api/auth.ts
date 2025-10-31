import { apiClient, setTokens, clearTokens } from './client';
import { LoginResponse, User } from '@/types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export const authApi = {
  async login(credentials: LoginInput): Promise<LoginResponse> {
    const validated = loginSchema.parse(credentials);
    const response = await apiClient.post<LoginResponse>('/auth/login', validated);
    
    // Store tokens
    setTokens(response.data.accessToken, response.data.refreshToken);
    
    return response.data;
  },

  async signup(data: SignupInput): Promise<LoginResponse> {
    const validated = signupSchema.parse(data);
    const response = await apiClient.post<LoginResponse>('/auth/signup', {
      ...validated,
      roles: ['Customer'], // Default role
    });
    
    // Store tokens
    setTokens(response.data.accessToken, response.data.refreshToken);
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const response = await apiClient.get<{ url: string }>('/oauth/google/url', {
      params: { redirectUrl },
    });
    return response.data;
  },

  async handleGoogleCallback(code: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/google', { code });
    
    // Store tokens
    setTokens(response.data.accessToken, response.data.refreshToken);
    
    return response.data;
  },
};
