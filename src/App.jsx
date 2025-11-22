import { useState } from 'react';
import Layout from './components/layout/Layout';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerChat from './pages/ManagerChat';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeChat from './pages/EmployeeChat';
import EmployeeNotifications from './pages/EmployeeNotifications';
import EmployeePerformance from './pages/EmployeePerformance';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

function App() {
  const { user, login, logout, loading } = useAuth();
  const { isDark, setIsDark, theme } = useTheme();
  const [currentPath, setCurrentPath] = useState(user ? `/${user.role}` : '/');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  const handleNavigation = (path) => {
    setCurrentPath(path);
  };

  const renderDashboard = () => {
    // Common pages for all roles
    if (currentPath === '/profile') return <Profile user={user} theme={theme} />;
    if (currentPath === '/settings') return <Settings isDark={isDark} setIsDark={setIsDark} theme={theme} />;
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        if (currentPath === '/manager/chat') return <ManagerChat />;
        return <ManagerDashboard onNavigate={handleNavigation} />;
      case 'employee':
      default:
        if (currentPath === '/employee/chat') return <EmployeeChat />;
        if (currentPath === '/employee/notifications') return <EmployeeNotifications />;
        if (currentPath === '/employee/performance') return <EmployeePerformance />;
        return <EmployeeDashboard onNavigate={handleNavigation} theme={theme} />;
    }
  };

  return (
    <div className={isDark ? 'dark' : ''} style={{ backgroundColor: theme.background, color: theme.color, minHeight: '100vh' }}>
      <Layout 
        userRole={user.role} 
        userName={user.name}
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={logout}
        theme={theme}
      >
        {renderDashboard()}
      </Layout>
    </div>
  );
}

export default App;