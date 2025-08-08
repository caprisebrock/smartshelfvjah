import React, { useState, useRef, useEffect, Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MessageCircle, Plus, Send, Bot, User, Loader2, ArrowLeft, AlertCircle, BookOpen, FileText, Target, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { useChat } from '../lib/ChatContext';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/ToastContext';
import { supabase } from '../lib/supabaseClient';
import { saveMessageToSupabase } from '../lib/supabase/saveMessageToSupabase';
import { isToday, isYesterday, format } from 'date-fns';
import { v4 as uuid } from 'uuid';

// Helper function to group sessions by link type
const groupSessionsByType = (sessions: any[]) => {
  const groups: Record<string, any[]> = {
    habit: [],
    note: [],
    learning_resource: [],
    general: []
  };

  sessions.forEach(session => {
    // Determine link type based on linked fields
    let linkType = 'general';
    if (session.linked_habit) {
      linkType = 'habit';
    } else if (session.linked_learning_resource) {
      linkType = 'learning_resource';
    } else if (session.link_type) {
      linkType = session.link_type;
    }
    
    if (groups[linkType]) {
      groups[linkType].push(session);
    } else {
      groups.general.push(session);
    }
  });

  return groups;
};

// Helper function to get icon for link type
const getLinkTypeIcon = (linkType: string) => {
  switch (linkType) {
    case 'habit':
      return <Target className="w-4 h-4" />;
    case 'note':
      return <FileText className="w-4 h-4" />;
    case 'learning_resource':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

// Helper function to get display name for link type
const getLinkTypeName = (linkType: string) => {
  switch (linkType) {
    case 'habit':
      return '📚 Reading Habit';
    case 'note':
      return '📝 Notes';
    case 'learning_resource':
      return '📖 Learning Resources';
    default:
      return '📁 General Chat';
  }
};

// Helper function to format date labels
function formatDateLabel(date: string) {
  const d = new Date(date);
  const isValidDate = !isNaN(d.getTime());
  
  if (!isValidDate) {
    console.warn("Invalid date in formatDateLabel:", date);
    return 'Unknown Date';
  }
  
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

export default function AIChatPage() {
  const { user } = useUser();
  const { state, sendMessage, loadSession, createNewSession } = useChat();
  const { addToast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [selectedTone, setSelectedTone] = useState('Summary');
  const [selectedLink, setSelectedLink] = useState('');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');
  const [selectedLinkType, setSelectedLinkType] = useState<'habit' | 'learning_resource' | ''>('');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [learningResources, setLearningResources] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; content: string; created_at: string; role?: 'user' | 'assistant' }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; user_id: string; created_at: string }>>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to load messages for an existing session
  const loadMessagesForSession = async (sessionId: string) => {
    const { data: messages, error } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('order', { ascending: true });

    if (!error && messages) {
      setMessages(messages);
    }
  };

  // Function to update session title in local state
  const updateSessionTitleInState = (sessionId: string, newTitle: string) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  // Check for existing session on page load (deprecated - sessions are now managed explicitly)
  // Removed automatic session creation to prevent duplicates

  // Load sessions from Supabase
  useEffect(() => {
    if (!user?.id) return;

    const loadSessions = async () => {
      setLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, title, user_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading sessions:', error);
        } else {
          setSessions(data || []);
        }
      } catch (err) {
        console.error('Error loading sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [user?.id]);

  // Auto-select most recent session on mount (only if no session is currently selected)
  useEffect(() => {
    if (!user?.id || sessions.length === 0 || selectedSessionId) return;

    // Select the first (most recent) session
    const mostRecentSession = sessions[0];
    if (mostRecentSession) {
      setSelectedSessionId(mostRecentSession.id);
      console.log('Auto-selected most recent session:', mostRecentSession.title);
    } else {
      console.warn('No sessions found for user');
    }
  }, [user?.id, sessions, selectedSessionId]);

  // Supabase Realtime listener for session messages
  useEffect(() => {
    if (!selectedSessionId) return;

    const channel = supabase
      .channel('session-messages-listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${selectedSessionId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Map sender field to role for compatibility
          const processedMessage = {
            ...newMessage,
            role: newMessage.sender as 'user' | 'assistant'
          };

          setMessages((prev) => [...prev, processedMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSessionId]);

  // Load messages for selected session
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('session_messages')
          .select('id, content, created_at, sender')
          .eq('session_id', selectedSessionId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
        } else {
          // Map sender field to role for compatibility
          const processedMessages = (data || []).map(msg => ({
            ...msg,
            role: msg.sender as 'user' | 'assistant'
          }));
          setMessages(processedMessages);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    loadMessages();
  }, [selectedSessionId]);

  // Supabase Realtime listener for session title updates
  useEffect(() => {
    const channel = supabase
      .channel('realtime-session-titles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
        },
        (payload) => {
          const updatedSession = payload.new;
          if (!updatedSession?.id || !updatedSession?.title) return;

          // Update local state / UI cache
          updateSessionTitleInState(updatedSession.id, updatedSession.title);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load real data for linking
  useEffect(() => {
    if (!user?.id) return;

    const loadLinkableData = async () => {
      setLoadingData(true);
      try {
        // Load learning resources
        const { data: resources, error: resourcesError } = await supabase
          .from('learning_resources')
          .select('id, title, type')
          .eq('user_id', user.id);

        if (resourcesError) {
          console.error('Error loading learning resources:', resourcesError);
        } else {
          setLearningResources(resources || []);
        }

        // Load habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('id, title, category')
          .eq('user_id', user.id);

        if (habitsError) {
          console.error('Error loading habits:', habitsError);
        } else {
          setHabits(habitsData || []);
        }
      } catch (err) {
        console.error('Error loading linkable data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadLinkableData();
  }, [user?.id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowToneDropdown(false);
        setShowLinkDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Check if a session is selected
    if (!selectedSessionId) {
      setError('Please select a session or start a new chat first');
      addToast('Please select a session or start a new chat first', 'error');
      return;
    }
    
    // Store the message content before clearing input
    const messageContent = inputValue.trim();
    
    // Step 1: Optimistically add user message to local UI
    setMessages((prev) => [
      ...prev,
      {
        id: uuid(), // temp ID
        content: messageContent,
        sender: 'user',
        role: 'user',
        created_at: new Date().toISOString(),
        session_id: selectedSessionId,
      }
    ]);
    setInputValue(""); // Clear input field immediately
    setIsLoading(true);

    try {
      const currentSessionId = selectedSessionId;

      // Step 3: Save USER message to Supabase (background operation)
      saveMessageToSupabase({
        sessionId: currentSessionId,
        userId: user.id,
        sender: "user",
        content: messageContent,
      }).catch(error => {
        console.error("Failed to save user message to database:", error);
        // Don't show error to user for background operations
      });

      // Step 4: Call API to get assistant reply
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages: [...messages, { role: "user", content: messageContent }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.response?.content;
      if (!reply) throw new Error("No assistant reply received");

      // Step 5: Optimistically add assistant reply to local UI
      setMessages((prev) => [
        ...prev,
        {
          id: uuid(), // temp ID
          content: reply,
          sender: 'assistant',
          role: 'assistant',
          created_at: new Date().toISOString(),
          session_id: currentSessionId,
        }
      ]);

      // Step 6: Save ASSISTANT reply to Supabase (background operation)
      saveMessageToSupabase({
        sessionId: currentSessionId,
        userId: user.id,
        sender: "assistant",
        content: reply,
      }).catch(error => {
        console.error("Failed to save assistant message to database:", error);
        // Don't show error to user for background operations
      });

    } catch (error) {
      console.error("❌ Chat send error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while sending.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false); // Always re-enable Send button
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedSessionId) return;

    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('session_messages')
        .delete()
        .eq('id', messageId)
        .eq('session_id', selectedSessionId);

      if (error) {
        console.error('Error deleting message:', error);
        addToast('Failed to delete message', 'error');
        return;
      }

      // Remove from local state
      setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      addToast('Message deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      addToast('Failed to delete message', 'error');
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionTitle: string) => {
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete "${sessionTitle}"? This will permanently remove the session and all its messages.`)) {
      return;
    }

    try {
      // Step 1: Delete all messages in the session
      const { error: messagesError } = await supabase
        .from('session_messages')
        .delete()
        .eq('session_id', sessionId);

      if (messagesError) {
        console.error('Error deleting session messages:', messagesError);
        addToast('Failed to delete session messages', 'error');
        return;
      }

      // Step 2: Delete the session itself
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        addToast('Failed to delete session', 'error');
        return;
      }

      // Step 3: Optimistically update local state
      setSessions((prev) => prev.filter(session => session.id !== sessionId));

      // Step 4: If the deleted session was currently selected, clear the selection
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setMessages([]);
      }

      addToast('Session deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      addToast('Failed to delete session', 'error');
    }
  };

  const handleNewChat = async () => {
    // Use selected link data
    const linkType = selectedLinkType || 'general';
    const linkId = selectedLinkId || undefined;
    const linkTitle = selectedLink || '';
    
    try {
      // Create new session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          title: "Untitled Chat",
          link_type: linkType,
          link_id: linkId,
          link_title: linkTitle,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Set as selected session
      setSelectedSessionId(sessionData.id);
      
      // Clear messages for new session
      setMessages([]);
      
      // Refresh sessions list
      const { data: updatedSessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, title, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!sessionsError) {
        setSessions(updatedSessions || []);
      }
      
    } catch (error) {
      console.error('Error creating new session:', error);
      addToast('Failed to create new session', 'error');
    }
  };

  // Group sessions for sidebar display
  const groupedSessions = groupSessionsByType(state.sessions);

  // Show loading state if user is not authenticated
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI Chat - SmartShelf</title>
        <meta name="description" content="Chat with AI about your learning" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Sessions */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Chat</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingSessions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors relative
                      ${selectedSessionId === session.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <MessageCircle className={`w-4 h-4 ${
                        selectedSessionId === session.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate">{session.title || 'Untitled'}</span>
                      </div>
                    </div>
                    
                    {/* Delete Icon - Visible on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id, session.title || 'Untitled');
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">Start a new chat to begin</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header with Back Button */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Current Session Info */}
            {sessionId && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="font-medium">Untitled Chat</span>
                {selectedLinkType === 'learning_resource' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    📚 Linked to learning resource
                  </span>
                )}
                {selectedLinkType === 'habit' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    🎯 Linked to habit
                  </span>
                )}
              </div>
            )}

            {messages.length === 0 && !isLoading && !sessionId && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-sm">No chat selected</p>
                </div>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No messages in this session</p>
                <p className="text-xs">Start a conversation to see messages here</p>
              </div>
            ) : (
              (() => {
                let lastDate = null;
                return messages.map((message, i) => {
                  const date = new Date(message.created_at);
                  if (isNaN(date.getTime())) return null; // 🚫 Skip invalid messages

                  const currentDate = date.toDateString();
                  const showDate = currentDate !== lastDate;
                  lastDate = currentDate;

                  return (
                    <Fragment key={message.id || i}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <div className="text-gray-400 text-xs font-medium bg-gray-50 px-3 py-1 rounded-full">
                            {formatDateLabel(date)}
                          </div>
                        </div>
                      )}
                      <div
                        key={message.id}
                        className={`group relative flex w-full mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* DELETE ICON (Visible on Hover) */}
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="absolute -top-2 -right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>

                        {/* MESSAGE BUBBLE */}
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm
                            ${message.role === 'user' 
                              ? 'bg-blue-500 text-white rounded-br-md' 
                              : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'}`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </Fragment>
                  );
                });
              })()
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-200 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="max-w-4xl mx-auto">
              {/* Error Display */}
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="flex gap-3 mb-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={isLoading}
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoading ? 'Sending...' : 'Send'}
                  </span>
                </button>
              </div>

              {/* Modern Tone and Link Controls */}
              <div className="flex items-center gap-2 text-sm dropdown-container">
                {/* Tone Control */}
                <div className="relative dropdown-container flex items-center gap-2">
                  <button
                    onClick={() => setShowToneDropdown(!showToneDropdown)}
                    className="w-8 h-8 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="text-sm">➕</span>
                  </button>
                  {selectedTone && selectedTone !== 'Summary' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      <span>🟦 {selectedTone}</span>
                      <button
                        onClick={() => setSelectedTone('Summary')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ❌
                      </button>
                    </div>
                  )}
                  {showToneDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                      {['Summary', 'Bullet Points', 'Reflective', 'Detailed', 'Insights'].map((tone) => (
                        <button
                          key={tone}
                          onClick={() => {
                            setSelectedTone(tone);
                            setShowToneDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Link Control */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowLinkDropdown(!showLinkDropdown)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-xs font-medium transition-colors"
                    disabled={loadingData}
                  >
                    <span>🔗</span>
                    <span>Link Chat</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showLinkDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[200px] max-h-60 overflow-y-auto">
                      {loadingData ? (
                        <div className="px-3 py-2 text-xs text-gray-500">Loading...</div>
                      ) : (
                        <>
                          {/* Learning Resources */}
                          {learningResources.length > 0 && (
                            <>
                              <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">Learning Resources</div>
                              {learningResources.map((resource) => (
                                <button
                                  key={resource.id}
                                  onClick={() => {
                                    setSelectedLink(resource.title);
                                    setSelectedLinkId(resource.id);
                                    setSelectedLinkType('learning_resource');
                                    setShowLinkDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                                >
                                  📚 {resource.title}
                                </button>
                              ))}
                            </>
                          )}

                          {/* Habits */}
                          {habits.length > 0 && (
                            <>
                              <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">Habits</div>
                              {habits.map((habit) => (
                                <button
                                  key={habit.id}
                                  onClick={() => {
                                    setSelectedLink(habit.title);
                                    setSelectedLinkId(habit.id);
                                    setSelectedLinkType('habit');
                                    setShowLinkDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700"
                                >
                                  🎯 {habit.title}
                                </button>
                              ))}
                            </>
                          )}

                          {/* No items message - only show if both lists are empty */}
                          {learningResources.length === 0 && habits.length === 0 && (
                            <div className="px-3 py-2 text-xs text-gray-500">No habits or learning resources found</div>
                          )}

                          {/* Remove link option */}
                          {selectedLink && (
                            <>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  setSelectedLink('');
                                  setSelectedLinkId('');
                                  setSelectedLinkType('');
                                  setShowLinkDropdown(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-red-600"
                              >
                                Remove Link
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Item Display */}
              {selectedLink && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    {selectedLinkType === 'habit' ? '🎯' : '📚'} Linked to: {selectedLink}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedLink('');
                      setSelectedLinkId('');
                      setSelectedLinkType('');
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ❌
                  </button>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}