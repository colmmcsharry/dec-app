import React, { createContext, useCallback, useContext, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [theme, setTheme] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

  // Stable callback so consumers don't tear down their effects/handlers each
  // render — and crucially so the toggle button doesn't get a new onPress
  // identity, which can intermittently swallow taps on real devices.
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Do not wrap `value` in useMemo here: React Compiler / strict ref checks can
  // interact badly with context consumers. A new object each render is fine —
  // only `theme` changes trigger meaningful updates anyway.
  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === 'dark', toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
