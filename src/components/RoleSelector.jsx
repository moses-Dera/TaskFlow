import Button from './ui/Button';

export default function RoleSelector({ currentRole, onRoleChange }) {
  const roles = [
    { key: 'admin', label: 'Admin', description: 'System oversight & control' },
    { key: 'manager', label: 'Manager', description: 'Team performance & coordination' },
    { key: 'employee', label: 'Employee', description: 'Daily tasks & progress' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Demo: Switch Role</p>
      <div className="space-y-2">
        {roles.map((role) => (
          <Button
            key={role.key}
            variant={currentRole === role.key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onRoleChange(role.key)}
            className="w-full justify-start"
          >
            <div className="text-left">
              <div className="font-medium">{role.label}</div>
              <div className="text-xs opacity-75">{role.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}