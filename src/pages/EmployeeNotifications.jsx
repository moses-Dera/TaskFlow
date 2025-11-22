import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function EmployeeNotifications() {
  const notifications = [
    { id: 1, type: 'task', title: 'New task assigned', message: 'Complete Q4 Sales Report', time: '2 hours ago', read: false },
    { id: 2, type: 'reminder', title: 'Task due soon', message: 'Review client feedback due in 1 hour', time: '1 hour ago', read: false },
    { id: 3, type: 'completed', title: 'Task completed', message: 'Project documentation updated', time: '3 hours ago', read: true },
    { id: 4, type: 'message', title: 'New message', message: 'Manager sent you a message', time: '5 hours ago', read: true },
  ];

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
        </CardContent>
      </Card>
    </div>
  );
}