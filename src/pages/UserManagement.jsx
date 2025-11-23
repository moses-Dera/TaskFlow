import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { teamAPI } from '../utils/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviting, setInviting] = useState(false);

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
      alert('Please enter an email address');
      return;
    }
    
    console.log('Inviting user:', inviteEmail, 'with role:', inviteRole);
    setInviting(true);
    
    try {
      const response = await teamAPI.inviteUser(inviteEmail, inviteRole);
      console.log('Invite response:', response);
      
      if (response.success) {
        alert('User invited successfully!');
        setInviteEmail('');
        setInviteRole('employee');
        await loadUsers();
      } else {
        alert('Failed to invite user: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to invite user: ' + error.message);
    } finally {
      setInviting(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email to invite"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          <button
            onClick={handleInviteUser}
            disabled={inviting}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                      <span className="text-sm font-medium text-gray-900">
                        {user.performance_score}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {user.tasks_completed}/{user.tasks_assigned}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
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
    </div>
  );
}