import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Info, CheckCircle, XCircle, Filter } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { logsAPI } from '../utils/api';

export default function ApplicationLogs() {
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await logsAPI.getLogs({ level: filter !== 'all' ? filter : undefined });
        if (response.success) {
          setLogs(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load logs:', error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [filter]);

  const getLogIcon = (level) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLogBadgeVariant = (level) => {
    switch (level) {
      case 'error': return 'error';
      case 'warning': return 'default';
      case 'success': return 'success';
      default: return 'primary';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Application Logs</h1>
          <p className="text-gray-600 mt-1">Monitor system events and activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Logs</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {logs.filter(log => log.level === 'error').length}
            </p>
            <p className="text-sm text-gray-600">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {logs.filter(log => log.level === 'warning').length}
            </p>
            <p className="text-sm text-gray-600">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Info className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {logs.filter(log => log.level === 'info').length}
            </p>
            <p className="text-sm text-gray-600">Info</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {logs.filter(log => log.level === 'success').length}
            </p>
            <p className="text-sm text-gray-600">Success</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getLogIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{log.message}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getLogBadgeVariant(log.level)}>
                        {log.level}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Source: {log.source}</p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}