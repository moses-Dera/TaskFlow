import { useState, useEffect } from 'react';
import { X, Calendar, Paperclip, File, Download, ExternalLink, CheckCircle, Upload, CalendarPlus } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { tasksAPI } from '../utils/api';

export default function TaskDetailModal({ task, onClose, onMarkComplete, isManagerView = false }) {
    const [activeTab, setActiveTab] = useState('details');
    const [taskFiles, setTaskFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        if (task) {
            loadFiles();
        }
    }, [task]);

    const loadFiles = async () => {
        setLoadingFiles(true);
        try {
            const response = await tasksAPI.getTaskFiles(task._id);
            if (response.success) {
                setTaskFiles(response.data);
            }
        } catch (err) {
            console.error('Failed to load files:', err);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        try {
            for (const file of files) {
                await tasksAPI.uploadFile(task._id, file);
            }
            setSuccessMsg(`${files.length} file(s) uploaded successfully`);
            loadFiles(); // Reload files
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError('Failed to upload files: ' + err.message);
        } finally {
            setUploading(false);
        }
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

    if (!task) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant={getStatusColor(task.status)}>
                                {task.status.replace('-', ' ')}
                            </Badge>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority} Priority
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {task.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Due Date</h3>
                            <div className="flex items-center text-gray-900 dark:text-white">
                                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                                {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                {isManagerView ? 'Assigned To' : 'Assigned By'}
                            </h3>
                            <div className="flex items-center text-gray-900 dark:text-white">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                                    {(isManagerView ? task.assigned_to?.name : task.assigned_by?.name)?.charAt(0) || 'U'}
                                </div>
                                {isManagerView ? (task.assigned_to?.name || 'Unknown') : (task.assigned_by?.name || 'Manager')}
                            </div>
                        </div>
                    </div>

                    {/* Attachments & Files */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Attachments & Submissions
                        </h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                                {successMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* File List */}
                            {loadingFiles ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : taskFiles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {taskFiles.map((file, idx) => {
                                        const fileUrl = `${import.meta.env.VITE_API_URL || 'https://task-manger-backend-z2yz.onrender.com/api'}/uploads/tasks/${file.filename}`;
                                        return (
                                            <div key={idx} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <File className="w-8 h-8 text-blue-500 mr-3" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>{file.name}</p>
                                                    <p className="text-xs text-gray-500">{file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}</p>
                                                </div>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No files attached.</p>
                            )}

                            {/* Upload Button (Only for non-managers or if managers want to add files) */}
                            {!isManagerView && task.status !== 'completed' && (
                                <div className="mt-4">
                                    <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        {uploading ? (
                                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Paperclip className="w-4 h-4 text-gray-500" />
                                        )}
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {uploading ? 'Uploading...' : 'Upload Files'}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const startDate = new Date();
                            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(task.description || '')}`;
                            window.open(googleCalendarUrl, '_blank');
                        }}
                    >
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Add to Calendar
                    </Button>

                    {!isManagerView && (
                        <Button
                            onClick={() => onMarkComplete && onMarkComplete(task._id)}
                            disabled={task.status === 'completed'}
                        >
                            {task.status === 'completed' ? 'Completed' : 'Mark as Complete'}
                        </Button>
                    )}

                    {isManagerView && (
                        <Button onClick={onClose}>Close</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
