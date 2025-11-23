import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { chatAPI, authAPI, getAuthToken } from '../utils/api';
// import io from 'socket.io-client'; // Install: npm install socket.io-client

export default function ManagerChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [messagesResponse, userResponse] = await Promise.all([
          chatAPI.getMessages(),
          authAPI.getCurrentUser()
        ]);
        
        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }
        if (userResponse.success) {
          setCurrentUser(userResponse.user);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Initialize WebSocket connection (disabled until socket.io-client is installed)
    // const token = getAuthToken();
    // if (token) {
    //   socketRef.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://task-manger-backend-z2yz.onrender.com', {
    //     auth: { token }
    //   });
    //   
    //   socketRef.current.on('connect', () => {
    //     setConnected(true);
    //   });
    //   
    //   socketRef.current.on('newMessage', (message) => {
    //     setMessages(prev => [...prev, message]);
    //   });
    //   
    //   socketRef.current.on('disconnect', () => {
    //     setConnected(false);
    //   });
    // }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Save to database
      const response = await chatAPI.sendMessage({ message: newMessage });
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
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
        <h1 className="text-2xl font-semibold text-gray-900">Team Chat</h1>
        <p className="text-gray-600 mt-1">Communicate with your team members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Team Chat
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Database Chat
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-4 h-96 overflow-y-auto">
                {messages.map((msg) => {
                  const isOwnMessage = currentUser && msg.sender_id._id === currentUser.id;
                  return (
                    <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {!isOwnMessage && (
                          <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_id.name}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}