import { useState } from 'react';
import { Video, Calendar, Clock, Users } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from './Card';
import Button from './Button';

export default function MeetingScheduler({ employees = [], onClose }) {
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    attendees: [],
    type: 'team' // 'team' or 'individual'
  });

  const scheduleMeeting = () => {
    const startDate = new Date(`${meetingData.date}T${meetingData.time}`);
    const endDate = new Date(startDate.getTime() + parseInt(meetingData.duration) * 60000);
    
    const attendeeEmails = meetingData.type === 'team' 
      ? employees.map(emp => `${emp.name.toLowerCase().replace(' ', '.')}@company.com`).join(',')
      : meetingData.attendees.join(',');

    const googleMeetUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingData.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent('Google Meet: https://meet.google.com/new')}&add=${attendeeEmails}`;
    
    window.open(googleMeetUrl, '_blank');
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Schedule Meeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Team standup meeting"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={meetingData.time}
                onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <select
              value={meetingData.duration}
              onChange={(e) => setMeetingData({...meetingData, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
            <div className="flex space-x-3">
              <button
                onClick={() => setMeetingData({...meetingData, type: 'team'})}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  meetingData.type === 'team' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Team Meeting
              </button>
              <button
                onClick={() => setMeetingData({...meetingData, type: 'individual'})}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  meetingData.type === 'individual' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'
                }`}
              >
                <Video className="w-4 h-4 mr-2" />
                1-on-1
              </button>
            </div>
          </div>

          {meetingData.type === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
              <select
                onChange={(e) => setMeetingData({...meetingData, attendees: [e.target.value]})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Choose employee</option>
                {employees.map(emp => (
                  <option key={emp.name} value={`${emp.name.toLowerCase().replace(' ', '.')}@company.com`}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={scheduleMeeting} className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}