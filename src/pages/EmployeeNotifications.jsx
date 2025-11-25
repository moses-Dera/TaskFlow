import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { notificationsAPI } from '../utils/api';
import { useSocket } from '../context/SocketContext';

export default function EmployeeNotifications() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      console.error('Cannot mark notification as read: missing ID');
      return;
    }

    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsAPI.getNotifications();
        if (response.success) {
          // Transform backend data to ensure proper structure
          const transformedNotifications = (response.data || []).map(notif => ({
            ...notif,
            _id: notif._id || notif.id,
            time: notif.time || getRelativeTime(notif.createdAt)
          }));
          setNotifications(transformedNotifications);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Helper function to get relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Socket.io real-time notification listener
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log('🔔 New notification received:', data);

      // Add new notification to the top of the list
      const newNotif = {
        _id: data.id || data._id,
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        time: 'Just now',
        createdAt: data.timestamp || new Date().toISOString()
      };

      setNotifications(prev => [newNotif, ...prev]);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

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
              {notifications.filter(n => n != null && n._id != null).map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                  style={{ cursor: notification.read ? 'default' : 'pointer' }}
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