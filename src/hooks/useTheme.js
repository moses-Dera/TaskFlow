import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('taskManagerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsDark(settings.theme === 'dark');
    } else {
      // Set default to light mode
      setIsDark(false);
    }
  }, []);

  const getTheme = () => ({
    // Light mode colors
    background: isDark ? '#111827' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937',
    cardBg: isDark ? '#1f2937' : '#f9fafb',
    border: isDark ? '#374151' : '#e5e7eb',
    textPrimary: isDark ? '#ffffff' : '#1f2937',
    textSecondary: isDark ? '#d1d5db' : '#4b5563',
    textMuted: isDark ? '#9ca3af' : '#9ca3af',
    // Light mode specific
    lightBg: '#ffffff',
    lightText: '#1f2937',
    lightSubtext: '#6b7280',
    lightBorder: '#e5e7eb',
    lightCard: '#f9fafb'
  });

  return { isDark, setIsDark, theme: getTheme() };
}