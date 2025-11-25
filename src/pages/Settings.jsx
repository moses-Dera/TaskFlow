import { useState, useEffect } from 'react';
import { Bell, Moon, Globe, Shield, Key, Eye, EyeOff } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import NotificationModal from '../components/ui/NotificationModal';
import { usersAPI } from '../utils/api';

export default function Settings({ isDark, setIsDark, currentTheme }) {
  const [settings, setSettings] = useState({
    language: 'english',
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    profileVisibility: true,
    activityStatus: true
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const showNotification = (type, title, message) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };
  
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('taskManagerSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      // Try to load from API if available
      const apiSettings = await settingsAPI.getSettings();
      if (apiSettings) {
        setSettings(prev => ({ ...prev, ...apiSettings }));
      }
    } catch (error) {
      console.log('Using local settings only');
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('taskManagerSettings', JSON.stringify(newSettings));
    
    // Handle notification permissions
    if (key === 'pushNotifications' && value) {
      await requestNotificationPermission();
    }
    
    // Save to API
    try {
      await settingsAPI.updateSettings(newSettings);
    } catch (error) {
      console.log('Settings saved locally only');
    }
  };
  
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showNotification('success', 'Success!', 'Push notifications enabled!');
      } else {
        showNotification('warning', 'Permission Denied', 'Push notifications blocked by browser');
        updateSetting('pushNotifications', false);
      }
    }
  };

  const handleThemeChange = (theme) => {
    console.log('Theme selected:', theme);
    setIsDark(theme); // This now handles all theme logic
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
  };

  const saveAllSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('taskManagerSettings', JSON.stringify(settings));
      await settingsAPI.updateSettings(settings);
      showNotification('success', 'Settings Saved!', 'All settings have been saved successfully.');
    } catch (error) {
      showNotification('warning', 'Partial Save', 'Settings saved locally only. Server sync failed.');
    }
    setLoading(false);
  };
  
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showNotification('error', 'Missing Information', 'Please fill in all password fields');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'Password Mismatch', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showNotification('error', 'Weak Password', 'New password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await settingsAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showNotification('success', 'Password Updated!', 'Your password has been changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showNotification('error', 'Password Change Failed', error.message || 'Failed to change password');
    }
    setLoading(false);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      language: 'english',
      emailNotifications: true,
      pushNotifications: true,
      meetingReminders: true,
      profileVisibility: true,
      activityStatus: true,
      theme: 'light'
    };
    setSettings(defaultSettings);
    setIsDark('light');
    localStorage.setItem('taskManagerSettings', JSON.stringify(defaultSettings));
    showNotification('success', 'Reset Complete!', 'All settings have been reset to defaults.');
  };
  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive task updates via email</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                className="w-4 h-4 text-primary" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browser notifications for urgent tasks</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.pushNotifications}
                onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                className="w-4 h-4 text-primary" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Meeting Reminders</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified before meetings</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.meetingReminders}
                onChange={(e) => updateSetting('meetingReminders', e.target.checked)}
                className="w-4 h-4 text-primary" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="w-5 h-5 mr-2" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
              <select 
                value={currentTheme || settings.theme || 'light'}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
              <select 
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button onClick={handlePasswordChange} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Profile Visibility</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Show profile to team members</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.profileVisibility}
                onChange={(e) => updateSetting('profileVisibility', e.target.checked)}
                className="w-4 h-4 text-primary" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Activity Status</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Show when you're online</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.activityStatus}
                onChange={(e) => updateSetting('activityStatus', e.target.checked)}
                className="w-4 h-4 text-primary" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3">
        <Button variant="outline" onClick={resetToDefaults} disabled={loading}>
          Reset to Defaults
        </Button>
        <Button onClick={saveAllSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
      
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}