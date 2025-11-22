import { useState, useEffect } from 'react';
import { Bell, Moon, Globe, Shield, Key } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings({ isDark, setIsDark }) {
  const [settings, setSettings] = useState({
    language: 'english',
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    profileVisibility: true,
    activityStatus: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('taskManagerSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('taskManagerSettings', JSON.stringify(newSettings));
  };

  const handleThemeChange = (theme) => {
    console.log('Theme selected:', theme);
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemDark);
    } else {
      setIsDark(theme === 'dark');
    }
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    localStorage.setItem('taskManagerSettings', JSON.stringify(newSettings));
  };

  const saveAllSettings = () => {
    localStorage.setItem('taskManagerSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      language: 'english',
      emailNotifications: true,
      pushNotifications: true,
      meetingReminders: true,
      profileVisibility: true,
      activityStatus: true
    };
    setSettings(defaultSettings);
    setIsDark(false);
    localStorage.setItem('taskManagerSettings', JSON.stringify(defaultSettings));
    alert('Settings reset to defaults!');
  };
  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                value={settings.theme || (isDark ? 'dark' : 'light')}
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
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Button>Change Password</Button>
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

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={resetToDefaults}>Reset to Defaults</Button>
        <Button onClick={saveAllSettings}>Save All Settings</Button>
      </div>
    </div>
  );
}