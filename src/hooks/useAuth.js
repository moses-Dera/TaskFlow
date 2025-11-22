import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('taskManagerUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Initialize dark mode
    const savedSettings = localStorage.getItem('taskManagerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('taskManagerUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskManagerUser');
  };

  return { user, login, logout, loading };
}