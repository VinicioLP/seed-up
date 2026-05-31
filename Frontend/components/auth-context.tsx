import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AUTH_STORAGE_KEY, apiFetch, setAuthExpiredHandler } from '@/lib/api';

const USERS_STORAGE_KEY = '@seedup:users';

type AuthUser = {
  id?: number;
  email: string;
  nickname: string;
  profilePhotoUri?: string;
};

type AuthSession = {
  token: string;
  user: AuthUser;
};

type ApiUser = {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signIn: (nickname: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  updateProfilePhoto: (photoUri: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeNickname(nickname: string) {
  return nickname.trim().toLowerCase();
}

async function getRegisteredUsers() {
  const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);

  return storedUsers ? (JSON.parse(storedUsers) as AuthUser[]) : [];
}

function normalizeApiUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email ?? '',
    nickname: apiUser.name ?? apiUser.username ?? apiUser.email?.split('@')[0] ?? 'Jardineiro',
    profilePhotoUri: apiUser.avatar_url,
  };
}

async function parseApiError(response: Response, fallback: string) {
  const errorBody = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  const firstValidationMessage = errorBody?.errors
    ? Object.values(errorBody.errors).flat()[0]
    : null;

  return firstValidationMessage ?? errorBody?.message ?? fallback;
}

async function saveCurrentSession(session: AuthSession) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  return session.user;
}

async function saveRegisteredUsers(users: AuthUser[]) {
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      setUser(null);
      router.replace('/login');
    });

    return () => setAuthExpiredHandler(null);
  }, []);

  useEffect(() => {
    async function loadStoredUser() {
      try {
        const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (storedSession) {
          const parsedSession = JSON.parse(storedSession) as Partial<AuthSession>;
          const parsedUser = parsedSession.user;

          if (parsedSession.token && parsedUser) {
            setUser({
              id: parsedUser.id,
              email: parsedUser.email ?? '',
              nickname: parsedUser.nickname ?? parsedUser.email?.split('@')[0] ?? 'Jardineiro',
              profilePhotoUri: parsedUser.profilePhotoUri,
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredUser();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      signIn: async (nickname: string, password: string) => {
        const response = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            nickname: nickname.trim(),
            password,
          }),
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Nao foi possivel entrar.'));
        }

        const data = (await response.json()) as { token: string; user: ApiUser };
        const nextUser = normalizeApiUser(data.user);

        await saveCurrentSession({ token: data.token, user: nextUser });
        setUser(nextUser);
      },
      signUp: async (email: string, password: string, nickname: string) => {
        const response = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            nickname: nickname.trim(),
            password,
          }),
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response, 'Nao foi possivel cadastrar.'));
        }

        const data = (await response.json()) as { token: string; user: ApiUser };
        const nextUser = normalizeApiUser(data.user);

        await saveCurrentSession({ token: data.token, user: nextUser });
        setUser(nextUser);
      },
      updateNickname: async (nickname: string) => {
        if (!user) {
          return;
        }

        const cleanNickname = nickname.trim();
        const nicknameKey = normalizeNickname(cleanNickname);
        const users = await getRegisteredUsers();

        if (
          users.some(
            (registeredUser) =>
              registeredUser.email !== user.email &&
              normalizeNickname(registeredUser.nickname) === nicknameKey
          )
        ) {
          throw new Error('Este apelido ja esta em uso.');
        }

        const nextUser = { ...user, nickname: cleanNickname };
        const nextUsers = users.some((registeredUser) => registeredUser.email === user.email)
          ? users.map((registeredUser) =>
              registeredUser.email === user.email ? nextUser : registeredUser
            )
          : [...users, nextUser];

        await saveRegisteredUsers(nextUsers);
        const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const parsedSession = storedSession ? (JSON.parse(storedSession) as AuthSession) : null;

        if (parsedSession?.token) {
          await saveCurrentSession({ token: parsedSession.token, user: nextUser });
        }

        setUser(nextUser);
      },
      updateProfilePhoto: async (photoUri: string) => {
        if (!user) {
          return;
        }

        const nextUser = { ...user, profilePhotoUri: photoUri };
        const users = await getRegisteredUsers();
        const nextUsers = users.some((registeredUser) => registeredUser.email === user.email)
          ? users.map((registeredUser) =>
              registeredUser.email === user.email ? nextUser : registeredUser
            )
          : [...users, nextUser];

        await saveRegisteredUsers(nextUsers);
        const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const parsedSession = storedSession ? (JSON.parse(storedSession) as AuthSession) : null;

        if (parsedSession?.token) {
          await saveCurrentSession({ token: parsedSession.token, user: nextUser });
        }

        setUser(nextUser);
      },
      signOut: async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      },
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
