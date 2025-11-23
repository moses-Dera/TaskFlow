import { useState } from 'react';
import { Settings, Save, Mail, Shield, Database, Bell } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function GlobalSettings() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'TaskFlow',
    systemDescription: 'Enterprise Task Management System',
    maintenanceMode: false,
    
    // Email Settings
    emailEnabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    emailFrom: 'noreply@taskflow.com',
    
    // Security Settings
    passwordMinLength: 6,
    sessionTimeout: 24,
    twoFactorAuth: false,
    
    // Notification Settings
    emailNotifications: true,
    taskReminders: true,
    performanceReports: true,
    
    // Database Settings
    backupFrequency: 'daily',
    retentionPeriod: 30,
    autoCleanup: true
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Global Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>System Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
              <input 
                type="text"
                value={settings.systemName}
                onChange={(e) => handleInputChange('systemName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                rows={3}
                value={settings.systemDescription}
                onChange={(e) => handleInputChange('systemDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="maintenanceMode" className="text-sm text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Email Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="emailEnabled"
                checked={settings.emailEnabled}
                onChange={(e) => handleInputChange('emailEnabled', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="emailEnabled" className="text-sm text-gray-700">
                Enable Email Service
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input 
                type="text"
                value={settings.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input 
                type="text"
                value={settings.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
              <input 
                type="email"
                value={settings.emailFrom}
                onChange={(e) => handleInputChange('emailFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input 
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (hours)
              </label>
              <input 
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="twoFactorAuth" className="text-sm text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="taskReminders"
                checked={settings.taskReminders}
                onChange={(e) => handleInputChange('taskReminders', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="taskReminders" className="text-sm text-gray-700">
                Task Reminders
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="performanceReports"
                checked={settings.performanceReports}
                onChange={(e) => handleInputChange('performanceReports', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="performanceReports" className="text-sm text-gray-700">
                Performance Reports
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Database Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select 
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period (days)
              </label>
              <input 
                type="number"
                value={settings.retentionPeriod}
                onChange={(e) => handleInputChange('retentionPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <input 
                type="checkbox"
                id="autoCleanup"
                checked={settings.autoCleanup}
                onChange={(e) => handleInputChange('autoCleanup', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="autoCleanup" className="text-sm text-gray-700">
                Auto Cleanup Old Data
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}