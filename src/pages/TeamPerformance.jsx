import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Users, Calendar, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { CircularProgress } from '../components/charts/ProgressBar';
import SimpleLineChart from '../components/charts/LineChart';
import { teamAPI } from '../utils/api';

export default function TeamPerformance() {
  const [employees, setEmployees] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeamPerformance = async () => {
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
        console.error('Failed to load team performance:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamPerformance();
  }, []);

  const performanceData = [
    { name: 'Week 1', value: Math.floor((performance?.completed_tasks || 0) * 0.2) },
    { name: 'Week 2', value: Math.floor((performance?.completed_tasks || 0) * 0.3) },
    { name: 'Week 3', value: Math.floor((performance?.completed_tasks || 0) * 0.25) },
    { name: 'Week 4', value: Math.floor((performance?.completed_tasks || 0) * 0.25) },
  ];

  const stats = [
    { label: 'Total Tasks', value: performance?.total_tasks?.toString() || '0', icon: Target, color: 'text-blue-600' },
    { label: 'Completed Tasks', value: performance?.completed_tasks?.toString() || '0', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Team Members', value: employees.length.toString(), icon: Users, color: 'text-purple-600' },
    { label: 'Completion Rate', value: `${performance?.completion_rate || 0}%`, icon: Award, color: 'text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Team Performance</h1>
        <p className="text-gray-600 mt-1">Monitor your team's productivity and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CircularProgress value={performance?.completion_rate || 0} size={100} />
            <p className="text-sm text-gray-600 mt-3">Overall Team Completion Rate</p>
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
            <CardTitle>Team Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={performanceData} />
            <p className="text-sm text-gray-500 mt-2 text-center">Tasks completed per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">
                        {employee.tasks_completed}/{employee.tasks_assigned} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      employee.performance_score === 'A' ? 'bg-green-100 text-green-800' :
                      employee.performance_score === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.performance_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-900">High Performers</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(emp => emp.performance_score === 'A').length}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-900">Average Performers</p>
              <p className="text-2xl font-bold text-blue-600">
                {employees.filter(emp => emp.performance_score === 'B').length}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="font-medium text-orange-900">Need Support</p>
              <p className="text-2xl font-bold text-orange-600">
                {employees.filter(emp => !['A', 'B'].includes(emp.performance_score)).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}