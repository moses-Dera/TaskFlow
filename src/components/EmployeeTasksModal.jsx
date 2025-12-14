import { useState, useEffect } from 'react';
import { X, Search, Filter, Calendar, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { tasksAPI } from '../utils/api';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';
import TaskDetailModal from './TaskDetailModal';

export default function EmployeeTasksModal({ employee, onClose, initialFilter = 'all' }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(initialFilter); // all, pending, completed, overdue
    const [search, setSearch] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (employee) {
            loadTasks();
        }
    }, [employee]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const response = await tasksAPI.getTasks({ assigned_to: employee.id });
            if (response.success) {
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Failed to load employee tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' ||
                (filter === 'completed' && task.status === 'completed') ||
                (filter === 'pending' && task.status !== 'completed' && task.status !== 'overdue') ||
                (filter === 'overdue' && task.status === 'overdue');

            return matchesSearch && matchesFilter;
        });
    };

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Avatar
                            src={employee.profilePicture}
                            name={employee.name}
                            size="w-12 h-12 text-xl"
                            fallbackColor="bg-primary"
                        />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.department} • {employee.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex space-x-2">
                        {['all', 'pending', 'completed', 'overdue'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : getFilteredTasks().length > 0 ? (
                        <div className="space-y-3">
                            {getFilteredTasks().map((task) => (
                                <div
                                    key={task._id}
                                    onClick={() => setSelectedTask(task)}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all hover:shadow-sm group"
                                >
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            {task.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : task.status === 'overdue' ? (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                {task.title}
                                            </h4>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Badge variant={getStatusColor(task.status)}>
                                            {task.status.replace('-', ' ')}
                                        </Badge>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium">No tasks found</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    isManagerView={true}
                />
            )}
        </div>
    );
}
