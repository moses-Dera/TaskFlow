import { useState, useEffect } from 'react';
import { authAPI, getAuthToken, clearAuthToken } from '../utils/api';
import '../utils/cleanup'; // Run cleanup on import

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.user);
          } else {
            clearAuthToken();
          }
        } catch (error) {
          clearAuthToken();
        }
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
    };
    
    loadUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    clearAuthToken();
  };

  return { user, login, logout, loading };
}