import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Calendar, Star } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';

import { useSocket } from '../context/SocketContext';
import { CircularProgress } from '../components/charts/ProgressBar';
import SimpleLineChart from '../components/charts/LineChart';
import { tasksAPI, authAPI } from '../utils/api';

export default function EmployeePerformance() {
  const { socket } = useSocket();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    total: 0,
    onTimeRate: 0,
    score: 'N/A'
  });
  const [achievements, setAchievements] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const loadData = async () => {
    try {
      // Get current user if not already loaded
      if (!user) {
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.user);
        }
      }

      // Get performance stats from API
      const perfResponse = await tasksAPI.getPerformanceStats();
      if (perfResponse.success) {
        const perfData = perfResponse.data;
        setStats({
          completed: perfData.completed_tasks,
          total: perfData.total_tasks,
          onTimeRate: perfData.on_time_completion,
          score: perfData.performance_score
        });
        setWeeklyData(perfData.weekly_performance || []);
        setAchievements(perfData.achievements || []);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for task updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (data) => {
      console.log('Task update received in Performance:', data);
      // Refresh stats when a task is updated (e.g. completed)
      loadData();
    };

    socket.on('task_updated', handleTaskUpdate);

    return () => {
      socket.off('task_updated', handleTaskUpdate);
    };
  }, [socket]);

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
            <SimpleLineChart data={weeklyData} />
            <p className="text-sm text-gray-500 mt-2 text-center">Tasks completed per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`space-y-4 ${achievements.length === 0 ? 'text-center py-6' : ''}`}>
                {achievements.length > 0 ? (
                  achievements.map((achievement) => {
                    let Icon = Award;
                    if (achievement.icon === 'TrendingUp') Icon = TrendingUp;
                    if (achievement.icon === 'Target') Icon = Target;
                    if (achievement.icon === 'Star') Icon = Star;

                    const bgColors = {
                      green: 'bg-green-50',
                      blue: 'bg-blue-50',
                      purple: 'bg-purple-50',
                      yellow: 'bg-yellow-50',
                      gray: 'bg-gray-50'
                    };

                    const textColors = {
                      green: 'text-green-900',
                      blue: 'text-blue-900',
                      purple: 'text-purple-900',
                      yellow: 'text-yellow-900',
                      gray: 'text-gray-900'
                    };

                    const iconColors = {
                      green: 'text-green-600',
                      blue: 'text-blue-600',
                      purple: 'text-purple-600',
                      yellow: 'text-yellow-600',
                      gray: 'text-gray-600'
                    };

                    const descColors = {
                      green: 'text-green-700',
                      blue: 'text-blue-700',
                      purple: 'text-purple-700',
                      yellow: 'text-yellow-700',
                      gray: 'text-gray-700'
                    };

                    return (
                      <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg ${bgColors[achievement.color] || 'bg-gray-50'}`}>
                        <Icon className={`w-6 h-6 ${iconColors[achievement.color] || 'text-gray-600'}`} />
                        <div>
                          <p className={`font-medium ${textColors[achievement.color] || 'text-gray-900'}`}>{achievement.title}</p>
                          <p className={`text-sm ${descColors[achievement.color] || 'text-gray-700'}`}>{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">Complete tasks to earn achievements!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}