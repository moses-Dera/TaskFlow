import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Profile({ user }) {
  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen p-6 -m-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-gray-500 capitalize">{user?.role || 'Employee'}</p>
            <Button className="mt-4" size="sm">Change Photo</Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}