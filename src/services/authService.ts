import {
    api,
    clearAuthToken,
    getAuthToken,
    setAuthToken,
} from '@/lib/api/client';
import type {
    AuthUser,
    CustomerUpdate,
    ProfileResponse,
    Vehicle,
    VehicleInput,
    LoginResponse,
} from '@/types';

const AUTH_USER_KEY = 'authUser';

export interface RegisterData {
    userName: string;
    email: string;
    password: string;
    contactOne: string;
    contactTwo?: string | null;
    address?: string | null;
    role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

export const getStoredUser = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(AUTH_USER_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data) as AuthUser;
    } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem(AUTH_USER_KEY);
        return null;
    }
};

export const storeUser = (user: AuthUser) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_USER_KEY);
};

export const login = async (
    email: string,
    password: string
): Promise<AuthUser> => {
    const response = await api<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    setAuthToken(response.token);
    storeUser(response.user);

    return response.user;
};

export const logout = () => {
    clearAuthToken();
    clearStoredUser();
};

export const register = (userData: RegisterData) =>
    api<MessageResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

export const getProfile = () => api<ProfileResponse>('/api/users/me');

export const updateProfile = (userId: number, payload: CustomerUpdate) =>
    api<ProfileResponse | MessageResponse>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

export const deleteProfile = async () => {
    await api<void>('/api/customers/me', { method: 'DELETE' });
    logout();
};

export const createVehicle = (payload: VehicleInput) =>
    api<Vehicle>('/api/customers/me/vehicles', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const listVehicles = () => api<Vehicle[]>('/api/customers/me/vehicles');

export const getVehicle = (vehicleId: number) =>
    api<Vehicle>(`/api/customers/me/vehicles/${vehicleId}`);

export const updateVehicle = (vehicleId: number, payload: VehicleInput) =>
    api<Vehicle>(`/api/customers/me/vehicles/${vehicleId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

export const deleteVehicle = (vehicleId: number) =>
    api<void>(`/api/customers/me/vehicles/${vehicleId}`, {
        method: 'DELETE',
    });

export interface MessageResponse {
    success?: boolean;
    message?: string;
}

export const forgotPassword = (email: string) =>
    api<MessageResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

export const resetPassword = (token: string, newPassword: string) =>
    api<MessageResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });

export const refreshAccessToken = async (): Promise<void> => {
    try {
        const response = await api<LoginResponse>('/api/auth/refresh', {
            method: 'POST',
        });

        setAuthToken(response.token);
        storeUser(response.user);
        console.log('✅ Token refreshed successfully');
    } catch (error) {
        console.error('❌ Token refresh failed:', error);
        // If refresh fails, clear auth state
        clearAuthToken();
        clearStoredUser();
        throw error;
    }
};

export const getUserInfo = async (): Promise<AuthUser> => {
    const response = await api<ProfileResponse>('/api/users/me');
    return response.user;
};

export const isAuthenticated = () => Boolean(getAuthToken());
