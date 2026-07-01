import { store } from '../store/store';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = store.getState().auth.token;

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  return response;
};
