import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { CircularProgress } from '../components/charts/ProgressBar';
import SimpleLineChart from '../components/charts/LineChart';
import { tasksAPI, authAPI } from '../utils/api';

export default function EmployeePerformance() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    total: 0,
    onTimeRate: 0,
    score: 'N/A'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.user);
        }

        // Get user's tasks
        const tasksResponse = await tasksAPI.getTasks();
        if (tasksResponse.success) {
          const userTasks = tasksResponse.data;
          setTasks(userTasks);
          
          // Calculate stats
          const completed = userTasks.filter(task => task.status === 'completed').length;
          const total = userTasks.length;
          const onTime = userTasks.filter(task => 
            task.status === 'completed' && 
            new Date(task.updatedAt) <= new Date(task.due_date)
          ).length;
          const onTimeRate = completed > 0 ? Math.round((onTime / completed) * 100) : 0;
          const score = onTimeRate >= 90 ? 'A' : onTimeRate >= 80 ? 'B' : onTimeRate >= 70 ? 'C' : 'D';
          
          setStats({
            completed,
            total,
            onTimeRate,
            score
          });
        }
      } catch (error) {
        console.error('Failed to load performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const performanceData = [
    { name: 'Week 1', value: Math.floor(stats.completed * 0.2) },
    { name: 'Week 2', value: Math.floor(stats.completed * 0.3) },
    { name: 'Week 3', value: Math.floor(stats.completed * 0.25) },
    { name: 'Week 4', value: Math.floor(stats.completed * 0.25) },
  ];

  const statCards = [
    { label: 'Tasks Completed', value: stats.completed.toString(), icon: Target, color: 'text-green-600' },
    { label: 'On-Time Completion', value: `${stats.onTimeRate}%`, icon: Calendar, color: 'text-blue-600' },
    { label: 'Performance Score', value: stats.score, icon: Award, color: 'text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {user?.name ? `${user.name}'s Performance` : 'My Performance'}
        </h1>
        <p className="text-gray-600 mt-1">Track your progress and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CircularProgress value={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0} size={100} />
            <p className="text-sm text-gray-600 mt-3">Overall Completion Rate</p>
          </CardContent>
        </Card>

        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={performanceData} />
            <p className="text-sm text-gray-500 mt-2 text-center">Tasks completed per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Perfect Week</p>
                  <p className="text-sm text-green-700">Completed all tasks on time</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Productivity Boost</p>
                  <p className="text-sm text-blue-700">25% increase in task completion</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Goal Achieved</p>
                  <p className="text-sm text-purple-700">Reached monthly target early</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}