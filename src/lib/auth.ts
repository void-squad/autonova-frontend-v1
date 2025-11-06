const STATIC_ACCESS_TOKEN = import.meta.env.VITE_STATIC_AUTH_TOKEN;

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('accessToken');
    if (stored) return stored;
  }
  return STATIC_ACCESS_TOKEN || null;
};
