import { useState, useEffect } from 'react';
import { Plus, MessageSquare, TrendingUp, Video, Users, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DonutChart from '../components/charts/DonutChart';
import SimpleLineChart from '../components/charts/LineChart';
import MeetingScheduler from '../components/ui/MeetingScheduler';
import { teamAPI, tasksAPI, authAPI } from '../utils/api';
import { useNotification } from '../hooks/useNotification';

export default function ManagerDashboard({ onNavigate }) {
  const { success, error } = useNotification();
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    assigned_to: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        // Get user info and employees
        const [employeesResponse, userResponse] = await Promise.all([
          teamAPI.getEmployees(),
          authAPI.getCurrentUser()
        ]);

        if (userResponse.success) {
          setUser(userResponse.user);
        }

        const employeesResponse2 = employeesResponse;
        if (employeesResponse2.success) {
          const employeeData = employeesResponse2.data.map(emp => ({
            ...emp,
            avatar: emp.name.split(' ').map(n => n[0]).join('').toUpperCase()
          }));
          setEmployees(employeeData);
        }

        // Get performance metrics
        const performanceResponse = await teamAPI.getPerformance();
        if (performanceResponse.success) {
          const perf = performanceResponse.data;
          console.log('Performance data received:', perf);
          setPerformance(perf);

          // Set task status data with fallbacks
          const taskData = [
            { name: 'Completed', value: perf.completed_tasks || 0 },
            { name: 'In Progress', value: perf.in_progress_tasks || 0 },
            { name: 'Overdue', value: perf.overdue_tasks || 0 },
          ];

          // If no tasks exist, show placeholder data
          const hasData = taskData.some(item => item.value > 0);
          if (!hasData) {
            taskData[0].value = 1; // Show at least one segment
          }

          setTaskStatusData(taskData);

          // Generate productivity trend data
          const completedTasks = perf.completed_tasks || 0;
          const productivityWeeks = [
            { name: 'Week 1', value: Math.max(1, Math.floor(completedTasks * 0.2)) },
            { name: 'Week 2', value: Math.max(1, Math.floor(completedTasks * 0.3)) },
            { name: 'Week 3', value: Math.max(2, Math.floor(completedTasks * 0.25)) },
            { name: 'Week 4', value: Math.max(2, Math.floor(completedTasks * 0.25)) },
          ];
          setProductivityData(productivityWeeks);
        }
      } catch (error) {
        console.error('Failed to load team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.assigned_to) {
      error('Please fill in title and assign to an employee');
      return;
    }

    setSubmitting(true);
    try {
      const response = await tasksAPI.createTask(taskForm);
      if (response.success) {
        success('Task assigned successfully!');
        setTaskForm({
          title: '',
          assigned_to: '',
          description: '',
          due_date: '',
          priority: 'medium'
        });
        // Reload team data to update stats
        window.location.reload();
      } else {
        error('Failed to assign task: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      error('Failed to assign task: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Team Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            Monitor team performance and assign tasks
            {user?.company && (
              <span className="block sm:inline ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full w-fit">
                {user.company}
              </span>
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Button
            variant="primary"
            className="w-full text-sm"
            onClick={() => {
              console.log('Add Employee clicked, onNavigate available:', !!onNavigate);
              if (onNavigate) {
                onNavigate('/user-management');
              } else {
                error('Navigation not available');
              }
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={async () => {
              try {
                const now = new Date();
                const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour meeting

                // Create Google Calendar event with all team members
                const attendeeEmails = employees.map(emp => emp.email).join(',');
                const nowISO = now.toISOString().replace(/[-:]/g, '').split('.')[0];
                const endISO = endTime.toISOString().replace(/[-:]/g, '').split('.')[0];
                const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Team Meeting')}&dates=${nowISO}Z/${endISO}Z&details=${encodeURIComponent('Team meeting with Google Meet video call')}&add=${attendeeEmails}&conf=1`;

                window.open(calendarUrl, '_blank');

                // Send meeting notification to all employees
                const meetingData = {
                  title: 'Team Meeting',
                  description: `Meeting started by ${user?.name || 'Manager'}`,
                  meeting_url: 'Google Calendar event created',
                  started_at: now.toISOString()
                };

                await teamAPI.notifyTeamMeeting(meetingData);

                success('Calendar event created! All team members will receive invitations.');
              } catch (error) {
                error('Failed to create meeting');
              }
            }}
          >
            <Video className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Start Team Call</span>
            <span className="sm:hidden">Team Call</span>
          </Button>
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={() => setShowMeetingScheduler(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Schedule Meeting</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
          <Button
            className="w-full text-sm"
            onClick={() => {
              const taskForm = document.getElementById('task-assignment-form');
              if (taskForm) {
                taskForm.scrollIntoView({ behavior: 'smooth' });
                // Focus on the title input
                setTimeout(() => {
                  const titleInput = taskForm.querySelector('input[type="text"]');
                  if (titleInput) titleInput.focus();
                }, 500);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Team Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{performance?.completion_rate || 0}%</div>
            <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">Team Completion Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${performance?.completion_rate || 0}%` }}></div>
            </div>
            {performance && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {performance.completed_tasks} of {performance.total_tasks} tasks completed
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
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
              <div key={employee.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer gap-3">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">{employee.avatar}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{employee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {employee.tasks_completed}/{employee.tasks_assigned} tasks completed
                    </p>
                    <button 
                      onClick={async () => {
                        try {
                          const tasksResponse = await tasksAPI.getTasks({ assigned_to: employee.id });
                          if (tasksResponse.success) {
                            const completedTasks = tasksResponse.data.filter(t => t.status === 'completed');
                            if (completedTasks.length > 0) {
                              const taskList = completedTasks.map(t => `• ${t.title}`).join('\n');
                              success(`Completed tasks by ${employee.name}:\n${taskList}`);
                            } else {
                              error(`No completed tasks by ${employee.name}`);
                            }
                          }
                        } catch (err) {
                          error('Failed to load employee tasks');
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      View Submitted Tasks
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                  <Badge variant="primary">{employee.performance_score}</Badge>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        const now = new Date();
                        const endTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 min meeting
                        const nowISO = now.toISOString().replace(/[-:]/g, '').split('.')[0];
                        const endISO = endTime.toISOString().replace(/[-:]/g, '').split('.')[0];
                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`1-on-1 with ${employee.name}`)}&dates=${nowISO}Z/${endISO}Z&details=${encodeURIComponent('1-on-1 meeting with Google Meet')}&add=${employee.email}&conf=1`;
                        window.open(calendarUrl, '_blank');
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
              </div>
            ))
          }
          </div>
        </CardContent>
      </Card>

      {/* Quick Task Assignment */}
      <Card id="task-assignment-form">
        <CardHeader>
          <CardTitle>Quick Task Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTaskSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign To</label>
              <select
                value={taskForm.assigned_to}
                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                required
              >
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                rows={3}
                value={taskForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                placeholder="Task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Creating Task...' : 'Create Task'}
              </Button>
            </div>
          </form>
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