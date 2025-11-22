import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, userRole = 'employee', userName = 'John Doe', currentPath = '/', onNavigate, onLogout }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar userRole={userRole} currentPath={currentPath} onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden dark:bg-gray-900">
        <Header userRole={userRole} userName={userName} onLogout={onLogout} onNavigate={onNavigate} />
        
        <main className="flex-1 overflow-auto p-6 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}