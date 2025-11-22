import { useState } from 'react';
import { 
  BarChart3, Users, Settings, Bell, MessageSquare, 
  CheckSquare, TrendingUp, Shield, Activity, FileText 
} from 'lucide-react';

const roleMenus = {
  admin: [
    { icon: Activity, label: 'System Health', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Shield, label: 'Access Roles', path: '/admin/roles' },
    { icon: FileText, label: 'Application Logs', path: '/admin/logs' },
    { icon: Settings, label: 'Global Settings', path: '/admin/settings' },
  ],
  manager: [
    { icon: BarChart3, label: 'Team Dashboard', path: '/manager' },
    { icon: CheckSquare, label: 'Assign Tasks', path: '/manager/tasks' },
    { icon: TrendingUp, label: 'Team Performance', path: '/manager/performance' },
    { icon: MessageSquare, label: 'Chat', path: '/manager/chat' },
    { icon: Bell, label: 'Notifications', path: '/manager/notifications' },
  ],
  employee: [
    { icon: CheckSquare, label: 'My Tasks', path: '/employee' },
    { icon: TrendingUp, label: 'My Performance', path: '/employee/performance' },
    { icon: MessageSquare, label: 'Chat', path: '/employee/chat' },
    { icon: Bell, label: 'Notifications', path: '/employee/notifications' },
  ],
};

export default function Sidebar({ userRole = 'employee', currentPath = '/', onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuItems = roleMenus[userRole] || roleMenus.employee;

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          {isExpanded && (
            <span className="font-semibold text-gray-900 dark:text-white">TaskManager</span>
          )}
        </div>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate && onNavigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {isExpanded && (
                <span className="ml-3">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}