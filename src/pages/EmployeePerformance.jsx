import { TrendingUp, Target, Award, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { CircularProgress } from '../components/charts/ProgressBar';
import SimpleLineChart from '../components/charts/LineChart';

export default function EmployeePerformance() {
  const performanceData = [
    { name: 'Week 1', value: 8 },
    { name: 'Week 2', value: 12 },
    { name: 'Week 3', value: 10 },
    { name: 'Week 4', value: 15 },
  ];

  const stats = [
    { label: 'Tasks Completed', value: '45', icon: Target, color: 'text-green-600' },
    { label: 'On-Time Completion', value: '92%', icon: Calendar, color: 'text-blue-600' },
    { label: 'Performance Score', value: 'A-', icon: Award, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Performance</h1>
        <p className="text-gray-600 mt-1">Track your progress and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CircularProgress value={75} size={100} />
            <p className="text-sm text-gray-600 mt-3">Overall Completion Rate</p>
          </CardContent>
        </Card>

        {stats.map((stat) => {
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