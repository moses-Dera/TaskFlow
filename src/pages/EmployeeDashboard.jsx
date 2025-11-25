import { CheckCircle, Clock, MessageSquare, Calendar, Paperclip, Upload, CalendarPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CircularProgress } from '../components/charts/ProgressBar';
import { tasksAPI, authAPI } from '../utils/api';
import { useNotification } from '../hooks/useNotification';

export default function EmployeeDashboard({ onNavigate }) {
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState({ today: [], week: [], later: [] });
  const [focusTask, setFocusTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, streak: 0, completionRate: 0, onTimeCompletion: 0, performanceScore: 'N/A' });
  const [weeklyData, setWeeklyData] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [user, setUser] = useState(null);

  const handleMarkComplete = async (taskId) => {
    setUpdating(taskId);
    try {
      const response = await tasksAPI.updateTask(taskId, { status: 'completed' });
      if (response.success) {
        success('Task marked as completed!');
        
        // Update tasks in state instead of reloading
        setTasks(prevTasks => {
          const updateTaskInArray = (taskArray) => 
            taskArray.map(task => 
              task._id === taskId ? { ...task, status: 'completed' } : task
            );
          
          return {
            today: updateTaskInArray(prevTasks.today),
            week: updateTaskInArray(prevTasks.week),
            later: updateTaskInArray(prevTasks.later)
          };
        });
        
        // Update focus task if it's the one being completed
        if (focusTask && focusTask._id === taskId) {
          setFocusTask(null);
        }
        
        // Refresh performance stats
        try {
          const perfResponse = await tasksAPI.getPerformanceStats();
          if (perfResponse.success) {
            const perfData = perfResponse.data;
            setStats({
              completed: perfData.completed_tasks,
              streak: perfData.streak_days,
              completionRate: perfData.completion_rate,
              onTimeCompletion: perfData.on_time_completion,
              performanceScore: perfData.performance_score
            });
            setWeeklyData(perfData.weekly_performance || []);
          }
        } catch (perfErr) {
          console.error('Failed to refresh performance stats:', perfErr);
        }
      } else {
        error('Failed to update task: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      error('Failed to update task: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const [tasksResponse, userResponse, performanceResponse] = await Promise.all([
          tasksAPI.getTasks(),
          authAPI.getCurrentUser(),
          tasksAPI.getPerformanceStats()
        ]);
        
        if (userResponse.success) {
          setUser(userResponse.user);
        }
        
        // Load performance stats
        if (performanceResponse.success) {
          const perfData = performanceResponse.data;
          setStats({
            completed: perfData.completed_tasks,
            streak: perfData.streak_days,
            completionRate: perfData.completion_rate,
            onTimeCompletion: perfData.on_time_completion,
            performanceScore: perfData.performance_score
          });
          setWeeklyData(perfData.weekly_performance || []);
        }
        
        const response = tasksResponse;
        if (response.success) {
          const allTasks = response.data;
          
          // Categorize tasks
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          const todayTasks = allTasks.filter(task => {
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);
            return dueDate.toDateString() === today.toDateString();
          });
          
          const weekTasks = allTasks.filter(task => {
            if (!task.due_date) return false;
            const dueDate = new Date(task.due_date);
            return dueDate > today && dueDate <= nextWeek;
          });
          
          const laterTasks = allTasks.filter(task => {
            if (!task.due_date) return true; // Tasks without due date go to 'Later'
            const dueDate = new Date(task.due_date);
            return dueDate > nextWeek;
          });
          
          console.log('Task categorization:', {
            total: allTasks.length,
            today: todayTasks.length,
            week: weekTasks.length,
            later: laterTasks.length
          });
          
          // If no tasks are categorized, put all tasks in 'later' tab
          if (todayTasks.length === 0 && weekTasks.length === 0 && laterTasks.length === 0 && allTasks.length > 0) {
            console.log('No tasks categorized, putting all in later tab');
            setTasks({
              today: [],
              week: [],
              later: allTasks
            });
          } else {
            setTasks({
              today: todayTasks,
              week: weekTasks,
              later: laterTasks
            });
          }
          
          // Set focus task (most urgent)
          const urgentTask = todayTasks.find(task => task.priority === 'high' && task.status !== 'completed') ||
                            todayTasks.find(task => task.status !== 'completed') ||
                            weekTasks.find(task => task.priority === 'high' && task.status !== 'completed');
          
          if (urgentTask) {
            setFocusTask({
              ...urgentTask,
              dueDate: new Date(urgentTask.due_date).toLocaleDateString(),
              priority: urgentTask.priority.charAt(0).toUpperCase() + urgentTask.priority.slice(1)
            });
          }
          
          // Stats are now loaded from API above
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRowColor = (task) => {
    if (task.status === 'overdue') return 'bg-red-50 border-red-200';
    if (task.dueDate.includes('Today') || task.dueDate.includes('PM')) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Tasks</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Stay focused and track your progress
            {user?.company && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {user.company}
              </span>
            )}
          </p>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {Object.values(tasks).flat().filter(task => task.status !== 'completed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Remaining</div>
          </div>
        </div>
      </div>

      {/* Focus Task */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Most Urgent</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{focusTask?.title || 'No urgent tasks'}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">{focusTask?.description || 'Great job! No urgent tasks at the moment.'}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {focusTask?.dueDate || 'No due date'}
                </div>
                {focusTask && <Badge variant="error">{focusTask.priority} Priority</Badge>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 w-full lg:w-auto">
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  const startDate = new Date();
                  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(focusTask?.title || 'Task')}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(focusTask?.description || 'Task from TaskFlow')}`;
                  window.open(googleCalendarUrl, '_blank');
                }}
              >
                <CalendarPlus className="w-5 h-5 mr-2" />
                Add to Calendar
              </Button>
              <Button 
                size="lg"
                onClick={() => focusTask && handleMarkComplete(focusTask._id)}
                disabled={!focusTask || updating === focusTask._id}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {updating === focusTask?._id ? 'Updating...' : 'Mark Complete'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
                {[
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'later', label: 'Later' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks[activeTab] && tasks[activeTab].length > 0 ? tasks[activeTab].map((task) => (
                  <div
                    key={task._id || task.id}
                    className={`p-4 rounded-lg border transition-colors ${getRowColor(task)}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => task.status !== 'completed' && handleMarkComplete(task._id)}
                              disabled={updating === task._id}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div>
                              <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                          <button 
                            onClick={() => onNavigate && onNavigate('/employee/chat')}
                            className="p-1 text-gray-400 dark:text-gray-300 hover:text-primary"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* File Upload Section */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
                            <input type="file" className="hidden" multiple />
                            <Paperclip className="w-4 h-4" />
                            <span>Attach files</span>
                          </label>
                          <button 
                            onClick={() => {
                              const startDate = new Date();
                              const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                              const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent('Task reminder from B2B Task Manager')}`;
                              window.open(googleCalendarUrl, '_blank');
                            }}
                            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            <span>Add to Calendar</span>
                          </button>
                        </div>
                        <Button size="sm" variant="outline">
                          <Upload className="w-3 h-3 mr-1" />
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No tasks in this category
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Sidebar */}
        <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>My Performance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CircularProgress value={stats.completionRate} />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">Overall Completion Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.onTimeCompletion}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">On-Time Completion</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.performanceScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Performance Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{week.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (week.value / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{week.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {stats.completed > 0 && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-green-800 dark:text-green-300">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Recent Achievements</p>
                  <p className="text-sm">{stats.streak} day streak • {stats.completed} tasks completed</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}