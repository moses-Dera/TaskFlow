import { useState } from 'react';
import { Plus, MessageSquare, TrendingUp, Video, Users, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DonutChart from '../components/charts/DonutChart';
import SimpleLineChart from '../components/charts/LineChart';
import MeetingScheduler from '../components/ui/MeetingScheduler';

export default function ManagerDashboard({ onNavigate }) {
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const taskStatusData = [
    { name: 'Completed', value: 45 },
    { name: 'In Progress', value: 30 },
    { name: 'Overdue', value: 8 },
  ];

  const productivityData = [
    { name: 'Week 1', value: 12 },
    { name: 'Week 2', value: 19 },
    { name: 'Week 3', value: 15 },
    { name: 'Week 4', value: 22 },
  ];

  const employees = [
    { name: 'Alice Johnson', assigned: 12, completed: 10, score: 'A', avatar: 'AJ' },
    { name: 'Bob Smith', assigned: 8, completed: 7, score: 'B+', avatar: 'BS' },
    { name: 'Carol Davis', assigned: 15, completed: 12, score: 'A-', avatar: 'CD' },
    { name: 'David Wilson', assigned: 6, completed: 4, score: 'B', avatar: 'DW' },
  ];

  return (
    <div className="space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Team Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor team performance and assign tasks</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => {
              const meetUrl = `https://meet.google.com/new`;
              window.open(meetUrl, '_blank');
              // In real app, would send notifications to all employees
              alert('Meeting started! Link shared with all team members.');
            }}
          >
            <Video className="w-4 h-4 mr-2" />
            Start Team Call
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowMeetingScheduler(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Team Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">88%</div>
            <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">Team Completion Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={taskStatusData} />
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={productivityData} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Tasks completed weekly (last 30 days)</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.name} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{employee.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{employee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {employee.completed}/{employee.assigned} tasks completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="primary">{employee.score}</Badge>
                  <button 
                    onClick={() => {
                      const meetUrl = `https://meet.google.com/new`;
                      window.open(meetUrl, '_blank');
                    }}
                    className="p-2 text-gray-400 hover:text-primary"
                    title="Start 1-on-1 meeting"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('/manager/chat')}
                    className="p-2 text-gray-400 hover:text-primary"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Task Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Task Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Select employee</option>
                {employees.map(emp => (
                  <option key={emp.name} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">Create Task</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showMeetingScheduler && (
        <MeetingScheduler 
          employees={employees}
          onClose={() => setShowMeetingScheduler(false)}
        />
      )}
    </div>
  );
}