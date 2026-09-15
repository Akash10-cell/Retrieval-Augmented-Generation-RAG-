import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('second_brain_theme') || 'system');
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const theme = mode === 'system' ? systemTheme : mode;

  useEffect(() => {
    localStorage.setItem('second_brain_theme', mode);
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = useMemo(() => ({ mode, theme, setMode }), [mode, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-shell theme-${theme}`} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// The hook is intentionally exported with the provider for the local theme API.
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);