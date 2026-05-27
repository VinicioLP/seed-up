import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type ThemeName = 'light' | 'dark';

const palettes = {
  light: {
    name: 'light' as const,
    background: '#F8FAF7',
    surface: '#F2F4F1',
    surfaceStrong: '#FFFFFF',
    weather: '#CDEFFC',
    text: '#26332F',
    textStrong: '#222F2D',
    muted: '#626861',
    subtle: '#8E9892',
    border: '#EEF1ED',
    tint: '#07833B',
    iconBox: '#D8EEE2',
    mapFallback: '#073A35',
    mapButton: '#EEF3F0',
  },
  dark: {
    name: 'dark' as const,
    background: '#101713',
    surface: '#1B251F',
    surfaceStrong: '#243028',
    weather: '#173646',
    text: '#EFF6EF',
    textStrong: '#FFFFFF',
    muted: '#B7C2BA',
    subtle: '#89968D',
    border: '#263229',
    tint: '#4ADE80',
    iconBox: '#203C2B',
    mapFallback: '#061E1B',
    mapButton: '#E7EFEA',
  },
};

type AppThemeColors = (typeof palettes)[ThemeName];

type AppThemeContextValue = {
  colors: AppThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const colors = palettes[themeName];

  const value = useMemo(
    () => ({
      colors,
      isDark: themeName === 'dark',
      toggleTheme: () => setThemeName((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [colors, themeName]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return value;
}
