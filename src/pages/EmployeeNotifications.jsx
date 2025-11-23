import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { notificationsAPI } from '../utils/api';

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        if (response.success) {
          setNotifications(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'task': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'reminder': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'message': return <Bell className="w-5 h-5 text-purple-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Stay updated with your tasks and messages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      {!notification.read && <Badge variant="primary">New</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}