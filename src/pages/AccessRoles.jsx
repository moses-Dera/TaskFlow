import { useState, useEffect } from 'react';
import { Shield, Users, Settings, Eye } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { teamAPI } from '../utils/api';

export default function AccessRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await teamAPI.getEmployees();
        if (response.success) {
          // Group employees by role to get user counts
          const roleData = {};
          response.data.forEach(emp => {
            if (!roleData[emp.role]) {
              roleData[emp.role] = { count: 0, employees: [] };
            }
            roleData[emp.role].count++;
            roleData[emp.role].employees.push(emp);
          });

          const rolesList = [
            {
              id: 1,
              name: 'Administrator',
              description: 'Full system access with all permissions',
              permissions: ['User Management', 'System Settings', 'View All Data', 'Manage Roles', 'System Logs'],
              userCount: roleData['admin']?.count || 0,
              color: 'bg-red-100 text-red-800'
            },
            {
              id: 2,
              name: 'Manager',
              description: 'Team management and task assignment capabilities',
              permissions: ['Team Management', 'Task Assignment', 'Performance View', 'Chat Access'],
              userCount: roleData['manager']?.count || 0,
              color: 'bg-blue-100 text-blue-800'
            },
            {
              id: 3,
              name: 'Employee',
              description: 'Basic user access for task management',
              permissions: ['View Own Tasks', 'Update Task Status', 'Chat Access', 'Profile Management'],
              userCount: roleData['employee']?.count || 0,
              color: 'bg-green-100 text-green-800'
            }
          ];

          setRoles(rolesList);
        }
      } catch (error) {
        console.error('Failed to load roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Access Roles</h1>
        <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading roles...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{role.name}</span>
                </CardTitle>
                <Badge variant="default" className={role.color}>
                  {role.userCount} users
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{role.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Permissions:</h4>
                <div className="space-y-1">
                  {role.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Permission</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Admin</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Manager</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Employee</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'User Management',
                  'System Settings',
                  'View All Data',
                  'Team Management',
                  'Task Assignment',
                  'Performance View',
                  'Chat Access',
                  'Profile Management',
                  'View Own Tasks'
                ].map((permission) => (
                  <tr key={permission} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{permission}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {['Team Management', 'Task Assignment', 'Performance View', 'Chat Access', 'Profile Management', 'View Own Tasks'].includes(permission) ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto"></div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {['Chat Access', 'Profile Management', 'View Own Tasks'].includes(permission) ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                      ) : (
                        <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto"></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}