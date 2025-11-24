import { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Moon, Sun } from 'lucide-react';
import Button from '../components/ui/Button';
import SignUp from './SignUp';
import { authAPI, setAuthToken } from '../utils/api';
import { useTheme } from '../hooks/useTheme';

export default function Login({ onLogin, onBackToLanding }) {
  const { isDark, setIsDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        // Store only token
        setAuthToken(response.token);
        onLogin(response.user);
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      if (response.success) {
        setAuthToken(response.token);
        onLogin(response.user);
        return response; // Return success response
      } else {
        setError(response.error || 'Signup failed');
        throw new Error(response.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err.message || 'Network error. Please try again.');
      throw err; // Re-throw so SignUp component can handle it
    }
  };

  if (showSignUp) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setShowSignUp(false)} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${isDark ? 'dark' : ''}`}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <button
              onClick={() => setIsDark(isDark ? 'light' : 'dark')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in to TaskManager</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Employee Performance & Task Tracking</p>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="mt-2 text-sm text-primary hover:text-blue-700"
            >
              ← Back to Home
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mt-2">
              <a href="/forgot-password" className="text-sm text-primary hover:text-blue-700">
                Forgot password?
              </a>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <button
              onClick={() => setShowSignUp(true)}
              className="font-medium text-primary hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}