import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function EmployeeChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Manager', message: 'How is the Q4 report coming along?', time: '10:30 AM' },
    { id: 2, sender: 'You', message: 'Almost done, will submit by 5 PM today', time: '10:35 AM' },
    { id: 3, sender: 'Manager', message: 'Great! Let me know if you need any help', time: '10:36 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Chat</h1>
        <p className="text-gray-600 mt-1">Communicate with your team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === 'You' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-75 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button onClick={sendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}