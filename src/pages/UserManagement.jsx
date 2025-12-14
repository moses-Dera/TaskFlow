import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
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
  const [viewingUser, setViewingUser] = useState(null);

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

  const handleViewUser = (user) => {
    setViewingUser(user);
  };


  return (
    <div className="space-y-6">
  // ... inside UserManagement component
      const [invitedUser, setInvitedUser] = useState(null);

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

      // Show success modal with credentials if available
      if (response.user) {
        setInvitedUser(response.user);
        }

      await loadUsers();
      } else {
        error('Failed to invite user: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
        console.error('Invite error:', err);
      // Clean error message to avoid [object Object]
      const errMsg = err.response?.data?.error || err.message || 'Unknown error';
      error('Failed to invite user: ' + errMsg);
    } finally {
        setInviting(false);
    }
  };

  const handlePrintInvite = () => {
    const printContent = document.getElementById('invite-credentials-print');
      const windowUrl = 'about:blank';
      const uniqueName = new Date().getTime();
      const windowName = 'Print' + uniqueName;
      const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

      if (printWindow) {
        printWindow.document.write(`
        <html>
          <head>
            <title>Employee Credentials</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              .card { border: 2px solid #ccc; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; }
              h1 { color: #333; margin-bottom: 20px; text-align: center; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #666; font-size: 14px; }
              .value { font-size: 18px; color: #000; margin-top: 5px; }
              .temp-password { font-family: monospace; font-size: 24px; background: #eee; padding: 10px; border-radius: 4px; letter-spacing: 2px; }
              .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Welcome to TaskFlow! 🎉</h1>
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${invitedUser?.name || 'New Employee'}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${invitedUser?.email}</div>
              </div>
              <div class="field">
                <div class="label">Role:</div>
                <div class="value" style="text-transform: capitalize;">${invitedUser?.role}</div>
              </div>
              ${invitedUser?.tempPassword ? `
              <div class="field">
                <div class="label">Temporary Password:</div>
                <div class="value temp-password">${invitedUser.tempPassword}</div>
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Please log in at <strong>${window.location.origin}/login</strong> and change this password immediately.
              </p>
              ` : `
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                This user already has an account. They can log in with their existing credentials.
              </p>
              `}
              <div class="footer">
                Generated internally by TaskFlow Manager Dashboard
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // Small delay to ensure content is loaded before printing
      setTimeout(() => {
        printWindow.print();
      printWindow.close();
      }, 500);
    }
  };

      // ... (rest of the component) until return statement

      return (
      <div className="space-y-6">
        {/* ... existing header and cards ... */}
        <div className="flex flex-col lg:flex-col lg:justify-between lg:items-center gap-4">
          {/* ... (keep existing header content) */}
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage system users and their permissions</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:space-x-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email to invite"
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <button
              onClick={handleInviteUser}
              disabled={inviting}
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {inviting ? 'Inviting...' : 'Invite User'}
            </button>
            <button
              onClick={() => {
                setLoading(true);
                loadUsers();
              }}
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
              title="Refresh user data"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
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
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleViewUser(user)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={user.profilePicture}
                            name={user.name}
                            size="w-10 h-10"
                            fallbackColor="bg-primary"
                          />
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
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

        {/* Invitation Success Modal with Credentials */}
        {invitedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setInvitedUser(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">User Invited Successfully!</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The user has been added to your team.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6" id="invite-credentials">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{invitedUser.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{invitedUser.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{invitedUser.role}</span>
                  </div>

                  {invitedUser.tempPassword && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Temporary Password</p>
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-3 py-2">
                        <code className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider select-all">
                          {invitedUser.tempPassword}
                        </code>
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                        ⚠️ Share this securely. Valid for one-time login.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePrintInvite}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setInvitedUser(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* View User Modal */}
        {viewingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setViewingUser(null)}>
            <div
              className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="absolute -bottom-12 left-6">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {viewingUser.profilePicture ? (
                      <img src={viewingUser.profilePicture} alt={viewingUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {viewingUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/20 hover:bg-black/40 rounded-full p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="pt-16 pb-6 px-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingUser.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-500 dark:text-gray-400">{viewingUser.email}</p>
                    <Badge variant={getRoleBadgeVariant(viewingUser.role)} className="ml-2">
                      {viewingUser.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Contact info</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingUser.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{viewingUser.department || 'General'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</span>
                          <span className="font-bold text-gray-900 dark:text-white">{viewingUser.completion_rate || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${viewingUser.completion_rate || 0}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                          <p className="text-xl font-bold text-primary">{viewingUser.performance_score || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Tasks</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{viewingUser.tasks_completed || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 flex justify-end">
                <Button onClick={() => setViewingUser(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      );
}