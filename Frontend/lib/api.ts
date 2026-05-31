import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.137.1:8000';
export const AUTH_STORAGE_KEY = '@seedup:auth';

type AuthExpiredHandler = () => void;

let authExpiredHandler: AuthExpiredHandler | null = null;

export function setAuthExpiredHandler(handler: AuthExpiredHandler | null) {
  authExpiredHandler = handler;
}

export async function getStoredAuthToken() {
  const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(storedSession) as { token?: string };

    return parsedSession.token ?? null;
  } catch {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

    return null;
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getStoredAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    authExpiredHandler?.();
  }

  return response;
}
