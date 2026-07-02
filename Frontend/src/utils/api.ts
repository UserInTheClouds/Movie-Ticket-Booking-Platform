import { auth } from '../config/firebase';
import { store } from '../store/store';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = store.getState().auth.token;

  if (!token && auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (err) {
      console.error("Error refreshing token:", err);
    }
  }

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  return response;
};
