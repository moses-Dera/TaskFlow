import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, Search, Smile, MoreVertical, Edit2, Trash2, Pin, Reply, X, PinOff, Paperclip, File, Download, Image as ImageIcon } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { chatAPI, authAPI } from '../utils/api';
import { useNotification } from '../hooks/useNotification';
import { useSocket } from '../context/SocketContext';

// Common emoji reactions
const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export default function EmployeeChat() {
  const { error, success } = useNotification();
  const { socket, isConnected, isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

        // Load unread counts
        loadUnreadCounts();
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

          // Mark messages as read and clear unread count
          if (selectedUser) {
            await chatAPI.markAllAsRead(selectedUser._id);
            setUnreadCounts(prev => ({ ...prev, [selectedUser._id]: 0 }));
          } else {
            await chatAPI.markAllAsRead();
            setUnreadCounts(prev => ({ ...prev, 'group': 0 }));
          }
        }

        // Load pinned messages
        const pinnedResponse = await chatAPI.getPinnedMessages(selectedUser?._id);
        if (pinnedResponse.success) {
          setPinnedMessages(pinnedResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    if (!loading) {
      loadMessages();
    }
  }, [selectedUser, loading]);

  // Load unread counts
  const loadUnreadCounts = async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      if (response.success) {
        const counts = {};
        response.data.forEach(item => {
          counts[item._id] = item.unreadCount;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Failed to load unread counts:', error);
    }
  };

  // Socket.io real-time listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (data) => {
      console.log('📨 New message received:', data);

      const isRelevant = !selectedUser && !data.message.recipient_id ||
        selectedUser && data.message.sender_id && (
          data.message.sender_id._id === selectedUser._id ||
          data.message.recipient_id?._id === selectedUser._id
        );

      if (isRelevant) {
        setMessages(prev => [...prev, data.message]);

        // Mark as read if conversation is open and not own message
        if (data.message.sender_id._id !== currentUser.id) {
          chatAPI.markAsRead(data.message._id).catch(console.error);
        }
      } else {
        // Update unread count for other conversations
        const senderId = data.message.sender_id._id;
        const isGroupMsg = !data.message.recipient_id;
        const countKey = isGroupMsg ? 'group' : senderId;
        setUnreadCounts(prev => ({ ...prev, [countKey]: (prev[countKey] || 0) + 1 }));
      }
    };

    const handleUserTyping = (data) => {
      if (selectedUser && data.userId === selectedUser._id) {
        setTypingUser(data.userName);
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedUser && data.userId === selectedUser._id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    const handleMessageReaction = (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, reactions: updateReactions(msg.reactions, data) }
          : msg
      ));
    };

    const handleMessageEdited = (data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, message: data.newMessage, isEdited: true, editedAt: data.editedAt }
          : msg
      ));
    };

    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    const handleMessagePinned = (data) => {
      if (data.isPinned) {
        chatAPI.getPinnedMessages(selectedUser?._id).then(response => {
          if (response.success) setPinnedMessages(response.data || []);
        });
      } else {
        setPinnedMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('message_reaction', handleMessageReaction);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_pinned', handleMessagePinned);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('message_reaction', handleMessageReaction);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_pinned', handleMessagePinned);
    };
  }, [socket, currentUser, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateReactions = (reactions, data) => {
    if (!reactions) reactions = [];

    if (data.action === 'add') {
      const existing = reactions.find(r => r.emoji === data.emoji);
      if (existing) {
        if (!existing.users.some(u => u._id === data.userId)) {
          existing.users.push({ _id: data.userId, name: data.userName });
        }
      } else {
        reactions.push({ emoji: data.emoji, users: [{ _id: data.userId, name: data.userName }] });
      }
    } else {
      const index = reactions.findIndex(r => r.emoji === data.emoji);
      if (index !== -1) {
        reactions[index].users = reactions[index].users.filter(u => u._id !== data.userId);
        if (reactions[index].users.length === 0) {
          reactions.splice(index, 1);
        }
      }
    }

    return [...reactions];
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0 && !editingMessage) return;

    try {
      if (editingMessage) {
        const response = await chatAPI.editMessage(editingMessage._id, newMessage);
        if (response.success) {
          setMessages(prev => prev.map(msg =>
            msg._id === editingMessage._id ? response.data : msg
          ));
          setEditingMessage(null);
          setNewMessage('');
          success('Message updated');
        }
      } else {
        let attachments = [];

        // Upload files if any
        if (selectedFiles.length > 0) {
          const uploadResponse = await chatAPI.uploadAttachment(selectedFiles);
          if (uploadResponse.success) {
            attachments = uploadResponse.data;
          } else {
            error('Failed to upload files');
            return;
          }
        }

        const messageData = {
          message: newMessage || '📎 Attachment',
          ...(selectedUser && { recipient_id: selectedUser._id }),
          ...(replyingTo && { replyTo: replyingTo._id }),
          ...(attachments.length > 0 && { attachments })
        };

        const response = await chatAPI.sendMessage(messageData);
        if (response.success) {
          setMessages(prev => [...prev, response.data]);
        }
        setNewMessage('');
        setSelectedFiles([]);
        setReplyingTo(null);
      }

      if (socket && selectedUser) {
        socket.emit('stop_typing', { recipientId: selectedUser._id });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      error('Failed to send message: ' + err.message);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && selectedUser && e.target.value.trim()) {
      socket.emit('typing', { recipientId: selectedUser._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { recipientId: selectedUser._id });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const message = messages.find(m => m._id === messageId);
      const existingReaction = message?.reactions?.find(r => r.emoji === emoji);
      const hasReacted = existingReaction?.users?.some(u => u._id === currentUser?.id);

      if (hasReacted) {
        await chatAPI.removeReaction(messageId, emoji);
      } else {
        await chatAPI.addReaction(messageId, emoji);
      }

      setShowEmojiPicker(null);
    } catch (err) {
      error('Failed to add reaction');
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.message);
    setShowMessageMenu(null);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      success('Message deleted');
      setShowMessageMenu(null);
    } catch (err) {
      error('Failed to delete message');
    }
  };

  const handleSearchMessages = async () => {
    if (!messageSearchQuery.trim()) {
      const params = selectedUser ? { recipient_id: selectedUser._id } : {};
      const response = await chatAPI.getMessages(params);
      if (response.success) setMessages(response.data || []);
      return;
    }

    try {
      const response = await chatAPI.searchMessages(messageSearchQuery, selectedUser?._id);
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (err) {
      error('Search failed');
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

  const formatTimestamp = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
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
                className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${!selectedUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Group Chat</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Everyone in your company</p>
                </div>
                {unreadCounts['group'] > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCounts['group']}
                  </span>
                )}
              </button>

              {/* Individual Users */}
              {filteredTeamMembers.filter(member => member != null).map((member) => (
                <button
                  key={member._id}
                  onClick={() => setSelectedUser(member)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${selectedUser?._id === member._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isUserOnline(member._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                  </div>
                  {unreadCounts[member._id] > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCounts[member._id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 bg-white dark:bg-gray-800">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                {getChatTitle()}
              </div>
              <div className="flex items-center gap-2">
                {/* Message Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearchQuery}
                    onChange={(e) => {
                      setMessageSearchQuery(e.target.value);
                      if (e.target.value === '') handleSearchMessages();
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchMessages()}
                    className="pl-9 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-48"
                  />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {selectedUser ? 'Direct Message' : 'Group Chat'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pinned Messages</span>
                </div>
                {pinnedMessages.slice(0, 2).map(msg => (
                  <div key={msg._id} className="text-sm text-yellow-700 dark:text-yellow-300 truncate">
                    <strong>{msg.sender_id.name}:</strong> {msg.message}
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.filter(msg => msg != null && msg.sender_id != null).map((msg) => {
                  const isOwnMessage = currentUser && msg.sender_id._id === currentUser.id;
                  const isGroupChat = !selectedUser;

                  return (
                    <div key={msg._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group relative z-10`}>
                      <div className={`relative max-w-[85%] md:max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {msg.replyTo && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic truncate">
                            Replying to: {msg.replyTo.message?.substring(0, 50)}...
                          </div>
                        )}

                        <div className={`px-4 py-2 rounded-lg shadow-sm break-words ${isOwnMessage
                          ? (isGroupChat ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white' : 'bg-gradient-to-r from-purple-500 to-purple-400 text-white')
                          : (isGroupChat ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100')
                          }`}>
                          {!isOwnMessage && (
                            <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_id.name}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-all">{msg.message}</p>

                          {/* File Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((file, idx) => {
                                const isImage = file.mimeType?.startsWith('image/');
                                const fileUrl = file.url.startsWith('http')
                                  ? file.url
                                  : `${import.meta.env.VITE_API_URL || 'https://task-manger-backend-z2yz.onrender.com/api'}${file.url}`;

                                const handleDownload = async (e) => {
                                  e.preventDefault();
                                  try {
                                    const response = await fetch(fileUrl);
                                    const blob = await response.blob();
                                    const blobUrl = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = blobUrl;
                                    link.download = file.originalName || 'download';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(blobUrl);
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    window.open(fileUrl, '_blank');
                                  }
                                };

                                return (
                                  <div key={idx} className="bg-white/10 dark:bg-black/10 rounded-lg p-2">
                                    {isImage ? (
                                      <div className="relative group/img">
                                        <img
                                          src={fileUrl}
                                          alt={file.originalName}
                                          className="max-w-full max-h-48 rounded cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => window.open(fileUrl, '_blank')}
                                        />
                                        <a
                                          href={fileUrl}
                                          onClick={handleDownload}
                                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                                          title="Download"
                                        >
                                          <Download className="w-4 h-4" />
                                        </a>
                                      </div>
                                    ) : (
                                      <a
                                        href={fileUrl}
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/10 p-1 rounded transition-colors"
                                      >
                                        <File className="w-5 h-5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">{file.originalName}</p>
                                          <p className="text-xs opacity-60">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <Download className="w-4 h-4 flex-shrink-0" />
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-75">
                              {formatTimestamp(msg.createdAt)}
                              {msg.isEdited && <span className="ml-1">(edited)</span>}
                            </p>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)}
                                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                title="Add reaction"
                              >
                                <Smile className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setReplyingTo(msg)}
                                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                title="Reply"
                              >
                                <Reply className="w-3 h-3" />
                              </button>
                              {isOwnMessage && (
                                <button
                                  onClick={() => setShowMessageMenu(showMessageMenu === msg._id ? null : msg._id)}
                                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                  title="More options"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reactions - Outside message bubble */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                            {msg.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleReaction(msg._id, reaction.emoji)}
                                className="bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 shadow-sm"
                                title={reaction.users.map(u => u.name).join(', ')}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-gray-600 dark:text-gray-400">{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {showEmojiPicker === msg._id && (
                          <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 flex gap-1 z-50 border border-gray-200 dark:border-gray-600">
                            {EMOJI_OPTIONS.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg._id, emoji)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        {showMessageMenu === msg._id && isOwnMessage && (
                          <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-1 z-50 min-w-[150px] border border-gray-200 dark:border-gray-600">
                            <button
                              onClick={() => handleEditMessage(msg)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && typingUser && (
                <div className="flex justify-start">
                  <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      {typingUser} is typing...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {replyingTo && (
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Replying to {replyingTo.sender_id.name}: {replyingTo.message.substring(0, 50)}...
                  </span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {editingMessage && (
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Editing message
                  </span>
                </div>
                <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="text-blue-600 hover:text-blue-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Selected Files Indicator */}
            {selectedFiles.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 shadow-sm">
                    <Paperclip className="w-3 h-3 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedUser ? selectedUser.name : 'everyone'}...`}
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none overflow-y-auto min-h-[42px] max-h-[120px]"
                  />
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="employee-file-input"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      setSelectedFiles(prev => [...prev, ...files]);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('employee-file-input')?.click()}
                  title="Attach file"
                  className={`flex-shrink-0 ${selectedFiles.length > 0 ? 'text-primary border-primary bg-primary/10' : ''}`}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() && selectedFiles.length === 0}
                  className="flex-shrink-0"
                >
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