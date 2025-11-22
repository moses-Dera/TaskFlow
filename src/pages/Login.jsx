import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import SignUp from './SignUp';

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const demoUsers = [
    { email: 'admin@company.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    { email: 'manager@company.com', password: 'manager123', role: 'manager', name: 'John Manager' },
    { email: 'employee@company.com', password: 'employee123', role: 'employee', name: 'Jane Employee' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
      onLogin(user);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSignUp = (userData) => {
    onLogin({ ...userData, password: 'temp123' });
  };

  if (showSignUp) {
    return <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setShowSignUp(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to TaskManager</h2>
          <p className="mt-2 text-gray-600">Employee Performance & Task Tracking</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => setShowSignUp(true)}
              className="font-medium text-primary hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Demo Accounts:</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <div><strong>Admin:</strong> admin@company.com / admin123</div>
            <div><strong>Manager:</strong> manager@company.com / manager123</div>
            <div><strong>Employee:</strong> employee@company.com / employee123</div>
          </div>
        </div>
      </div>
    </div>
  );
}