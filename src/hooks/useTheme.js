import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  const applyTheme = (theme) => {
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemDark);
    } else {
      setIsDark(theme === 'dark');
    }
    setCurrentTheme(theme);
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('taskManagerSettings');
    let theme = 'light';
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      theme = settings.theme || 'light';
    }
    
    applyTheme(theme);

    // Listen for system theme changes when using system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (currentTheme === 'system') {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Listen for storage changes to sync theme across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'taskManagerSettings' && e.newValue) {
        const settings = JSON.parse(e.newValue);
        if (settings.theme) {
          applyTheme(settings.theme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentTheme]);

  const getTheme = () => ({
    background: isDark ? '#111827' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937',
    cardBg: isDark ? '#1f2937' : '#f9fafb',
    border: isDark ? '#374151' : '#e5e7eb',
    textPrimary: isDark ? '#ffffff' : '#1f2937',
    textSecondary: isDark ? '#d1d5db' : '#4b5563',
    textMuted: isDark ? '#9ca3af' : '#9ca3af',
    lightBg: '#ffffff',
    lightText: '#1f2937',
    lightSubtext: '#6b7280',
    lightBorder: '#e5e7eb',
    lightCard: '#f9fafb'
  });

  const updateTheme = (theme) => {
    applyTheme(theme);
    const savedSettings = localStorage.getItem('taskManagerSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.theme = theme;
    localStorage.setItem('taskManagerSettings', JSON.stringify(settings));
  };

  return { isDark, setIsDark: updateTheme, theme: getTheme(), currentTheme };
}