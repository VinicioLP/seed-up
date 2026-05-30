import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = '@seedup:user';
const USERS_STORAGE_KEY = '@seedup:users';

type AuthUser = {
  email: string;
  nickname: string;
  profilePhotoUri?: string;
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

async function saveCurrentUser(user: AuthUser) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  return user;
}

async function saveRegisteredUsers(users: AuthUser[]) {
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

async function createLocalUser(email: string, nickname: string) {
  const users = await getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanNickname = nickname.trim();
  const nicknameKey = normalizeNickname(cleanNickname);

  if (users.some((registeredUser) => normalizeNickname(registeredUser.nickname) === nicknameKey)) {
    throw new Error('Este apelido ja esta em uso.');
  }

  const user = { email: cleanEmail, nickname: cleanNickname };

  await saveRegisteredUsers([...users, user]);
  await saveCurrentUser(user);

  return user;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as Partial<AuthUser>;

          setUser({
            email: parsedUser.email ?? '',
            nickname: parsedUser.nickname ?? parsedUser.email?.split('@')[0] ?? 'Jardineiro',
            profilePhotoUri: parsedUser.profilePhotoUri,
          });
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
      signIn: async (nickname: string) => {
        const nicknameKey = normalizeNickname(nickname);
        const users = await getRegisteredUsers();
        const nextUser = users.find((item) => normalizeNickname(item.nickname) === nicknameKey);

        if (!nextUser) {
          throw new Error('Apelido nao encontrado. Cadastre-se primeiro.');
        }

        await saveCurrentUser(nextUser);
        setUser(nextUser);
      },
      signUp: async (email: string, _password: string, nickname: string) => {
        const nextUser = await createLocalUser(email, nickname);
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
        await saveCurrentUser(nextUser);
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
        await saveCurrentUser(nextUser);
        setUser(nextUser);
      },
      signOut: async () => {
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
