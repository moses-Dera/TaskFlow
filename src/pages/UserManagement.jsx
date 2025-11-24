import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { teamAPI } from '../utils/api';
import { useNotification } from '../hooks/useNotification';

export default function UserManagement() {
  const { success, error } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviting, setInviting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadUsers = async () => {
    try {
      const response = await teamAPI.getEmployees();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      error('Please enter an email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      error('Please enter a valid email address');
      return;
    }
    
    console.log('Inviting user:', inviteEmail, 'with role:', inviteRole);
    setInviting(true);
    
    try {
      const response = await teamAPI.inviteUser(inviteEmail, inviteRole);
      console.log('Invite response:', response);
      
      if (response.success) {
        success('User invited successfully!');
        setInviteEmail('');
        setInviteRole('employee');
        await loadUsers();
      } else {
        error('Failed to invite user: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Invite error:', err);
      error('Failed to invite user: ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.email) {
      error('Name and email are required');
      return;
    }

    setEditLoading(true);
    try {
      const response = await teamAPI.updateUser(editingUser, editForm);
      if (response.success) {
        success('User updated successfully!');
        setEditingUser(null);
        await loadUsers();
      } else {
        error('Failed to update user: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Edit error:', err);
      error('Failed to update user: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!deleteConfirm || deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    try {
      const response = await teamAPI.deleteUser(userId);
      if (response.success) {
        success('User deleted successfully!');
        setDeleteConfirm(null);
        await loadUsers();
      } else {
        error('Failed to delete user: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      error('Failed to delete user: ' + err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'employee': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage system users and their permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email to invite"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <button
            onClick={handleInviteUser}
            disabled={inviting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {inviting ? 'Inviting...' : 'Invite User'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-sm text-gray-600">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'manager').length}
            </p>
            <p className="text-sm text-gray-600">Managers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tasks</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {user.performance_score}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.performance_label}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {user.tasks_completed}/{user.tasks_assigned}
                        </span>
                        {user.tasks_assigned > 0 && (
                          <span className="text-xs text-gray-500">
                            {user.completion_rate}% complete
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition"
                          title={deleteConfirm === user.id ? "Click again to confirm delete" : "Delete user"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}