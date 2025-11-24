import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, Search } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { chatAPI, authAPI } from '../utils/api';
import { useNotification } from '../hooks/useNotification';

export default function EmployeeChat() {
  const { error } = useNotification();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // null = group chat
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userResponse, teamResponse] = await Promise.all([
          authAPI.getCurrentUser(),
          chatAPI.getTeamMembers()
        ]);

        if (userResponse.success) {
          setCurrentUser(userResponse.user);
        }
        if (teamResponse.success) {
          setTeamMembers(teamResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load messages when selected user changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const params = selectedUser ? { recipient_id: selectedUser._id } : {};
        const messagesResponse = await chatAPI.getMessages(params);

        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    if (!loading) {
      loadMessages();
    }
  }, [selectedUser, loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        message: newMessage,
        ...(selectedUser && { recipient_id: selectedUser._id })
      };

      const response = await chatAPI.sendMessage(messageData);
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
      }
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      error('Failed to send message: ' + err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChatTitle = () => {
    if (selectedUser) {
      return selectedUser.name;
    }
    return 'Group Chat';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Chat</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Communicate with your team</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Sidebar - User List */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center text-base">
              <Users className="w-5 h-5 mr-2" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* User List */}
            <div className="overflow-y-auto h-full">
              {/* Group Chat Option */}
              <button
                onClick={() => setSelectedUser(null)}
                className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${!selectedUser ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : ''
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Group Chat</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Everyone in your company</p>
                </div>
              </button>

              {/* Individual Users */}
              {filteredTeamMembers.map((member) => (
                <button
                  key={member._id}
                  onClick={() => setSelectedUser(member)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${selectedUser?._id === member._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : ''
                    }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                {getChatTitle()}
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {selectedUser ? 'Direct Message' : 'Group Chat'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = currentUser && msg.sender_id._id === currentUser.id;
                  return (
                    <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                        {!isOwnMessage && (
                          <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_id.name}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${selectedUser ? selectedUser.name : 'everyone'}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}