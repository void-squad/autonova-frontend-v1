const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// Types
export interface RegisterData {
    userName: string;
    email: string;
    password: string;
    contactOne: string;
    role: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UserInfo {
    id: number;
    email: string;
    userName: string;
    role: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userInfo: UserInfo;
}

export interface ApiError {
    error?: string;
    message?: string;
}

// Register new user
export const register = async (userData: RegisterData) => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userName: userData.userName,
            email: userData.email,
            password: userData.password,
            contactOne: userData.contactOne,
            role: userData.role
        })
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || error.message || 'Registration failed');
    }

    return response.json();
};

// Login user
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    console.log('🔐 Attempting login to:', `${API_BASE_URL}/api/auth/login`);
    console.log('📧 Email:', email);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
            console.error('❌ Login failed:', error);
            throw new Error(error.error || error.message || 'Invalid email or password');
        }

        const data: any = await response.json();
        console.log('✅ Login successful - Raw response:', data);

        // Map backend response to frontend format
        // Backend returns: { token, refreshToken, type, user }
        // Frontend expects: { accessToken, refreshToken, userInfo }
        const mappedResponse: LoginResponse = {
            accessToken: data.token,
            refreshToken: data.refreshToken,
            userInfo: data.user
        };

        console.log('✅ Login successful - User role:', data.user.role);

        // Store tokens in localStorage
        localStorage.setItem('accessToken', mappedResponse.accessToken);
        localStorage.setItem('refreshToken', mappedResponse.refreshToken);
        localStorage.setItem('userInfo', JSON.stringify(mappedResponse.userInfo));

        return mappedResponse;
    } catch (error) {
        console.error('🔥 Login error:', error);
        throw error;
    }
};

// Check if email exists (for signup validation)
export const checkEmailExists = async (email: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/users/email-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    const data = await response.json();
    return data.exists;
};

// Forgot password (request reset)
export const forgotPassword = async (email: string) => {
    console.log('📧 Requesting password reset for:', email);
    console.log('🔗 API URL:', `${API_BASE_URL}/api/auth/forgot-password`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
            console.error('❌ Forgot password failed:', error);
            throw new Error(error.error || error.message || 'Failed to send reset email');
        }

        const result = await response.json();
        console.log('✅ Password reset email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('🔥 Forgot password error:', error);
        throw error;
    }
};

// Reset password (with token)
export const resetPassword = async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || error.message || 'Password reset failed');
    }

    return response.json();
};

// Refresh access token
export const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        throw new Error('No refresh token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
        // Refresh token expired - clear storage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Session expired');
    }

    const data: any = await response.json();

    // Map backend response (token) to frontend format (accessToken)
    const accessToken = data.token || data.accessToken;
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
};

// Logout
export const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');

    // Redirect to login
    window.location.href = '/login';
};

// Get user info
export const getUserInfo = async (): Promise<UserInfo> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/api/auth/user-info`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        // Token expired, try refresh
        await refreshAccessToken();
        return getUserInfo(); // Retry
    }

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    return response.json();
};

// API call wrapper with auto-refresh
export const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        // Token expired, refresh and retry
        await refreshAccessToken();
        const newToken = localStorage.getItem('accessToken');

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    return response;
};
