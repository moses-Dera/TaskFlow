import { useState, useEffect } from 'react';
import { Users, Server, Activity, Database, MoreVertical } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/charts/ProgressBar';
import { teamAPI } from '../utils/api';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Get employees
        const employeesResponse = await teamAPI.getEmployees();
        if (employeesResponse.success) {
          setEmployees(employeesResponse.data);
        }

        // Get performance metrics
        const performanceResponse = await teamAPI.getPerformance();
        if (performanceResponse.success) {
          setPerformance(performanceResponse.data);
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const systemMetrics = [
    { label: 'Total Tasks', value: performance?.total_tasks?.toString() || '0', trend: '+12%', trendUp: true },
    { label: 'Completed Tasks', value: performance?.completed_tasks?.toString() || '0', trend: '+4%', trendUp: true },
    { label: 'Completion Rate', value: `${performance?.completion_rate || 0}%`, trend: '0%', trendUp: true },
    { label: 'Active Employees', value: employees.length.toString(), trend: '-2%', trendUp: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const resourceUsage = [
    { name: 'DB Storage', used: performance?.db_storage || 0, total: 100, unit: 'GB' },
    { name: 'CPU Load', used: performance?.cpu_load || 0, total: 100, unit: '%' },
    { name: 'Memory Usage', used: performance?.memory_usage || 0, total: 100, unit: '%' },
  ];

  const activityLogs = performance?.activity_logs || [
    { time: 'Loading...', action: 'Fetching activity logs...' },
  ];

  return (
    <div className="space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">System Overview</h1>
        <p className="text-gray-600 mt-1">Monitor platform health and manage users</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className={`text-sm font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success">
                      {employee.role}
                    </Badge>
                    <Badge variant="primary">
                      {employee.performance_score}
                    </Badge>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {resourceUsage.map((resource) => (
                <div key={resource.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{resource.name}</span>
                    <span className="text-sm text-gray-500">
                      {resource.used}{resource.unit} / {resource.total}{resource.unit}
                    </span>
                  </div>
                  <ProgressBar 
                    value={resource.used} 
                    max={resource.total}
                    color={resource.used > 80 ? 'bg-red-500' : resource.used > 60 ? 'bg-amber-500' : 'bg-green-500'}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLogs.map((log, index) => (
              <div key={index} className="flex items-center space-x-3 p-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-500">{log.time}</span>
                <span className="text-sm text-gray-900">{log.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}