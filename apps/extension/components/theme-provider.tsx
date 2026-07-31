import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = Exclude<Theme, 'system'>;

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeProvider({
  children,
  disableDocumentToggle = false,
}: {
  children: ReactNode;
  disableDocumentToggle?: boolean;
}) {
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => setSystemTheme(query.matches ? 'dark' : 'light');

    query.addEventListener('change', updateTheme);
    return () => query.removeEventListener('change', updateTheme);
  }, []);

  useEffect(() => {
    if (!disableDocumentToggle) {
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    }
  }, [resolvedTheme, disableDocumentToggle]);


  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

export { ThemeProvider, useTheme, type Theme };