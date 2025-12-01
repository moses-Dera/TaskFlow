import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import NotificationContainer from './components/NotificationContainer';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerChat from './pages/ManagerChat';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeChat from './pages/EmployeeChat';
import EmployeeNotifications from './pages/EmployeeNotifications';
import EmployeePerformance from './pages/EmployeePerformance';
import TeamPerformance from './pages/TeamPerformance';
import AssignTasks from './pages/AssignTasks';
import UserManagement from './pages/UserManagement';
import AccessRoles from './pages/AccessRoles';
import ApplicationLogs from './pages/ApplicationLogs';
import GlobalSettings from './pages/GlobalSettings';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';

function App() {
  const { user, login, logout, loading } = useAuth();
  const { isDark, setIsDark, theme, currentTheme } = useTheme();
  const [currentPath, setCurrentPath] = useState(user ? `/${user.role}` : '/');
  const [showLanding, setShowLanding] = useState(!user);

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

  const handleNavigation = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  const renderDashboard = () => {
    // Common pages for all roles
    if (currentPath === '/profile') return <Profile user={user} theme={theme} />;
    if (currentPath === '/settings') return <Settings isDark={isDark} setIsDark={setIsDark} theme={theme} currentTheme={currentTheme} />;

    switch (user.role) {
      case 'admin':
        if (currentPath === '/admin/users' || currentPath === '/user-management') return <UserManagement />;
        if (currentPath === '/admin/roles') return <AccessRoles />;
        if (currentPath === '/admin/logs') return <ApplicationLogs />;
        if (currentPath === '/admin/settings') return <GlobalSettings />;
        return <AdminDashboard />;
      case 'manager':
        if (currentPath === '/manager/chat') return <ManagerChat />;
        if (currentPath === '/manager/performance') return <TeamPerformance />;
        if (currentPath === '/manager/tasks') return <AssignTasks />;
        if (currentPath === '/manager/notifications') return <EmployeeNotifications onNavigate={handleNavigation} />;
        if (currentPath === '/user-management' || currentPath === '/manager/users') return <UserManagement />;
        return <ManagerDashboard onNavigate={handleNavigation} />;
      case 'employee':
      default:
        if (currentPath === '/employee/chat') return <EmployeeChat />;
        if (currentPath === '/employee/notifications') return <EmployeeNotifications onNavigate={handleNavigation} />;
        if (currentPath === '/employee/performance') return <EmployeePerformance />;
        return <EmployeeDashboard onNavigate={handleNavigation} theme={theme} />;
    }
  };

  return (
    <NotificationProvider>
      <SocketProvider>
        <Router>
          <div className={isDark ? 'dark' : ''} style={{ backgroundColor: theme.background, color: theme.color, minHeight: '100vh' }}>
            <NotificationContainer />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                !user ? (
                  showLanding ? (
                    <LandingPage
                      onGetStarted={() => setShowLanding(false)}
                      isDark={isDark}
                      setIsDark={setIsDark}
                    />
                  ) : (
                    <Login onLogin={login} onBackToLanding={() => setShowLanding(true)} />
                  )
                ) : (
                  <Navigate to={`/${user.role}`} replace />
                )
              } />
              <Route path="/login" element={
                !user ? (
                  <Login onLogin={login} onBackToLanding={() => setShowLanding(true)} />
                ) : (
                  <Navigate to={`/${user.role}`} replace />
                )
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route path="/*" element={
                user ? (
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
                ) : (
                  <Navigate to="/" replace />
                )
              } />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </NotificationProvider>
  );
}

export default App;