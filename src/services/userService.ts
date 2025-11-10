// User Management Service - All API calls go through gateway service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Types
export interface User {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  contactOne: string;
  contactTwo?: string;
  address?: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  userName: string;
  email: string;
  contactOne: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
}

export interface UpdateUserData {
  userName: string;
  contactOne: string;
  contactTwo?: string;
  address?: string;
}

export interface UpdateRoleData {
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
}

export interface ToggleStatusData {
  enabled: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

export interface ApiError {
  error?: string;
  message?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  employees: number;
  customers: number;
}

// Helper to get auth header
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get user statistics (Admin only)
export const getUserStats = async (): Promise<UserStats> => {
  console.log('📊 Fetching user statistics');

  const response = await fetch(`${API_BASE_URL}/api/users/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to fetch user stats');
  }

  return response.json();
};

// Get all users with optional filters (Admin only)
export const getAllUsers = async (filters?: UserFilters): Promise<User[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/users${queryString ? `?${queryString}` : ''}`;

  console.log('📋 Fetching users:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to fetch users');
  }

  return response.json();
};

// Get user by ID (Admin or owner)
export const getUserById = async (id: number): Promise<User> => {
  console.log('👤 Fetching user by ID:', id);

  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to fetch user');
  }

  return response.json();
};

// Create new user (Admin only)
export const createUser = async (userData: CreateUserData): Promise<User> => {
  console.log('➕ Creating user:', userData.email);

  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to create user');
  }

  return response.json();
};

// Update user profile (Admin can update anyone, others only themselves)
export const updateUser = async (id: number, userData: UpdateUserData): Promise<User> => {
  console.log('✏️ Updating user:', id);

  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to update user');
  }

  return response.json();
};

// Update user role (Admin only)
export const updateUserRole = async (id: number, roleData: UpdateRoleData): Promise<User> => {
  console.log('🔄 Updating user role:', id, roleData.role);

  const response = await fetch(`${API_BASE_URL}/api/users/${id}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to update user role');
  }

  return response.json();
};

// Toggle user status (Admin only) - This endpoint needs to be created in backend
export const toggleUserStatus = async (id: number, statusData: ToggleStatusData): Promise<User> => {
  console.log('🔄 Toggling user status:', id, statusData.enabled);

  const response = await fetch(`${API_BASE_URL}/api/users/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(statusData),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to toggle user status');
  }

  return response.json();
};

// Delete user (Admin only)
export const deleteUser = async (id: number): Promise<void> => {
  console.log('🗑️ Deleting user:', id);

  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'Failed to delete user');
  }

  // DELETE returns success message, not user object
  return;
};

// Check if email exists (Public - for validation)
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/users/email-exists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return data.exists;
};
