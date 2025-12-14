import { CheckCircle, Clock, MessageSquare, Calendar, Paperclip, Upload, CalendarPlus, X, Download, File, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CircularProgress } from '../components/charts/ProgressBar';
import { tasksAPI, authAPI } from '../utils/api';
import { useNotification } from '../hooks/useNotification';
import { useSocket } from '../context/SocketContext';

export default function EmployeeDashboard({ onNavigate }) {
  const { socket } = useSocket();
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState({ today: [], week: [], later: [] });
  const [focusTask, setFocusTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, streak: 0, completionRate: 0, onTimeCompletion: 0, performanceScore: 'N/A' });
  const [weeklyData, setWeeklyData] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [user, setUser] = useState(null);
  const [viewingFiles, setViewingFiles] = useState(null);
  const [taskFiles, setTaskFiles] = useState([]);

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
          today.setHours(0, 0, 0, 0);

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
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= tomorrow && dueDate <= nextWeek;
          });

          const laterTasks = allTasks.filter(task => {
            if (!task.due_date) return true; // Tasks without due date go to Later
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate > nextWeek;
          });

          setTasks({
            today: todayTasks,
            week: weekTasks,
            later: laterTasks
          });

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

  // Listen for task updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (data) => {
      console.log('Task update received in Dashboard:', data);

      // Reload everything to keep counts and lists in sync
      const loadTasks = async () => {
        try {
          const [tasksResponse, performanceResponse] = await Promise.all([
            tasksAPI.getTasks(),
            tasksAPI.getPerformanceStats()
          ]);

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

          if (tasksResponse.success) {
            const allTasks = tasksResponse.data;
            // Re-categorize tasks (Using the same logic as initial load)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
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
              dueDate.setHours(0, 0, 0, 0);
              return dueDate >= tomorrow && dueDate <= nextWeek;
            });

            const laterTasks = allTasks.filter(task => {
              if (!task.due_date) return true;
              const dueDate = new Date(task.due_date);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate > nextWeek;
            });

            setTasks({ today: todayTasks, week: weekTasks, later: laterTasks });
          }
        } catch (error) {
          console.error('Failed to reload tasks:', error);
        }
      };

      loadTasks();
    };

    socket.on('task_updated', handleTaskUpdate);

    return () => {
      socket.off('task_updated', handleTaskUpdate);
    };
  }, [socket]);

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
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
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
                {tasks[activeTab]?.length > 0 ? tasks[activeTab].map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                  const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={task._id || task.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${task.status === 'completed'
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : isOverdue
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                          : isDueToday
                            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      <div className="space-y-3">
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => task.status !== 'completed' && handleMarkComplete(task._id)}
                              disabled={updating === task._id}
                              className="w-5 h-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-base ${task.status === 'completed'
                                ? 'line-through text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                                }`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={getStatusColor(task.status)}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {/* Task Details */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {/* Priority */}
                          <div className={`px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                            <span className="font-medium capitalize">{task.priority} Priority</span>
                          </div>

                          {/* Due Date */}
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              {task.due_date
                                ? new Date(task.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                                : 'No due date'}
                            </span>
                          </div>

                          {/* Assigned By */}
                          {task.assigned_by && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                              <span className="text-xs">
                                Assigned by: <span className="font-medium">{task.assigned_by.name || 'Manager'}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files);
                                  if (files.length > 0) {
                                    try {
                                      for (const file of files) {
                                        await tasksAPI.uploadFile(task._id, file);
                                      }
                                      success(`${files.length} file(s) uploaded successfully!`);
                                    } catch (err) {
                                      error('Failed to upload files: ' + err.message);
                                    }
                                  }
                                }}
                              />
                              <Paperclip className="w-4 h-4" />
                              <span>Attach files</span>
                            </label>

                            <button
                              onClick={() => {
                                const startDate = new Date();
                                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(task.description || 'Task from TaskFlow')}`;
                                window.open(googleCalendarUrl, '_blank');
                              }}
                              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                            >
                              <CalendarPlus className="w-4 h-4" />
                              <span>Add to Calendar</span>
                            </button>

                            <button
                              onClick={() => onNavigate && onNavigate('/employee/chat')}
                              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Discuss</span>
                            </button>
                          </div>

                          <Button
                            size="sm"
                            variant={task.status === 'completed' ? 'outline' : 'default'}
                            onClick={async () => {
                              if (task.status === 'completed') {
                                // Load and show submitted files
                                try {
                                  const filesResponse = await tasksAPI.getTaskFiles(task._id);
                                  if (filesResponse.success && filesResponse.data.length > 0) {
                                    setTaskFiles(filesResponse.data);
                                    setViewingFiles(task);
                                  } else {
                                    error('No files submitted yet');
                                  }
                                } catch (err) {
                                  error('Failed to load files');
                                }
                              } else {
                                handleMarkComplete(task._id);
                              }
                            }}
                            disabled={updating === task._id}
                          >
                            {updating === task._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                Updating...
                              </>
                            ) : task.status === 'completed' ? (
                              <>
                                <Upload className="w-3 h-3 mr-1" />
                                View Files
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks in this category</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {activeTab === 'today' && 'You have no tasks due today'}
                      {activeTab === 'week' && 'You have no tasks due this week'}
                      {activeTab === 'later' && 'You have no upcoming tasks'}
                    </p>
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
                {weeklyData.length > 0 ? (
                  weeklyData.map((week, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No activity recorded yet
                  </div>
                )}
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

      {/* File Viewer Modal */}
      {viewingFiles && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Submitted Files - {viewingFiles.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {taskFiles.length} file(s) submitted
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingFiles(null);
                  setTaskFiles([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taskFiles.map((file, idx) => {
                  const isImage = file.mimeType?.startsWith('image/') ||
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                  const fileUrl = file.url && file.url.startsWith('http')
                    ? file.url
                    : `${import.meta.env.VITE_API_URL || 'https://task-manger-backend-z2yz.onrender.com/api'}/uploads/tasks/${file.filename}`;

                  const handleDownload = async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(fileUrl);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = file.name || 'download';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                      console.error('Download failed:', error);
                      window.open(fileUrl, '_blank');
                    }
                  };

                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {isImage ? (
                        <div className="relative group">
                          <img
                            src={fileUrl}
                            alt={file.name}
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => window.open(fileUrl, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <a
                              href={fileUrl}
                              onClick={handleDownload}
                              className="opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                              title="Download"
                            >
                              <Download className="w-5 h-5 text-gray-900 dark:text-white" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                          <File className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3 bg-white dark:bg-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </p>
                          <a
                            href={fileUrl}
                            onClick={handleDownload}
                            className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                        {file.uploaded_by && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            By: {file.uploaded_by.name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setViewingFiles(null);
                  setTaskFiles([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {focusTask && window.location.search.includes('taskId') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{focusTask.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={getStatusColor(focusTask.status)}>
                    {focusTask.status.replace('-', ' ')}
                  </Badge>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(focusTask.priority)}`}>
                    {focusTask.priority} Priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setFocusTask(null);
                  // Remove query param without refreshing
                  const url = new URL(window.location);
                  url.searchParams.delete('taskId');
                  window.history.pushState({}, '', url);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {focusTask.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Due Date</h3>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    {focusTask.due_date ? new Date(focusTask.due_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Assigned By</h3>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <Avatar
                      src={focusTask.assigned_by?.profilePicture}
                      name={focusTask.assigned_by?.name || 'Manager'}
                      size="w-8 h-8"
                      className="mr-3"
                      fallbackColor="bg-primary/10"
                    />
                    {focusTask.assigned_by?.name || 'Manager'}
                  </div>
                </div>
              </div>

              {/* Attachments Section in Detail View */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Attachments</h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          try {
                            for (const file of files) {
                              await tasksAPI.uploadFile(focusTask._id, file);
                            }
                            success(`${files.length} file(s) uploaded successfully!`);
                          } catch (err) {
                            error('Failed to upload files: ' + err.message);
                          }
                        }
                      }}
                    />
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Files</span>
                  </label>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const filesResponse = await tasksAPI.getTaskFiles(focusTask._id);
                        if (filesResponse.success && filesResponse.data.length > 0) {
                          setTaskFiles(filesResponse.data);
                          setViewingFiles(focusTask);
                        } else {
                          error('No files submitted yet');
                        }
                      } catch (err) {
                        error('Failed to load files');
                      }
                    }}
                  >
                    <File className="w-4 h-4 mr-2" />
                    View Submitted Files
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const startDate = new Date();
                  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(focusTask.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(focusTask.description || '')}`;
                  window.open(googleCalendarUrl, '_blank');
                }}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
              <Button
                onClick={() => {
                  if (focusTask.status !== 'completed') {
                    handleMarkComplete(focusTask._id);
                  }
                }}
                disabled={focusTask.status === 'completed' || updating === focusTask._id}
              >
                {updating === focusTask._id ? 'Updating...' : focusTask.status === 'completed' ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}