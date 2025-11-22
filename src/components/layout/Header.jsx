import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header({ userRole = 'employee', userName = 'John Doe', onLogout, onNavigate }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-300" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button 
                  onClick={() => onNavigate && onNavigate('/profile')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate('/settings')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Settings
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                <button 
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}