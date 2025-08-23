import React, { useState, useRef, useEffect, Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MessageCircle, Plus, Send, Bot, User, Loader2, ArrowLeft, AlertCircle, BookOpen, FileText, Target, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { useChat } from '../modules/ai-chat/context/ChatContext';
import { useUser } from '../modules/auth/hooks/useUser';
import { useToast } from '../modules/shared/context/ToastContext';
import { supabase } from '../modules/database/config/databaseConfig';
import { saveMessageToSupabase } from '../modules/ai-chat/services/saveMessageToSupabase';
import { isToday, isYesterday, format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import ConfirmDeleteModal from '../modules/shared/components/ConfirmDeleteModal';
import { generateSessionTitle } from '../modules/ai-chat/services/generateSessionTitle';
import ChatInput from '../modules/ai-chat/components/ChatInput';
import MessageList from '../modules/ai-chat/components/MessageList';

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

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);

  // Title generation state
  const [titleGenerated, setTitleGenerated] = useState<Set<string>>(new Set());
  const [typing, setTyping] = useState(false);

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

  // Function to generate and update session title
  const generateAndUpdateSessionTitle = async (sessionId: string) => {
    if (!sessionId || typeof sessionId !== 'string' || titleGenerated.has(sessionId)) {
      return; // Already generated or no session
    }

    let generatedTitle = "Untitled Chat"; // Default fallback title

    try {
      // Get user messages for this session
      const { data: messages, error } = await supabase
        .from('session_messages')
        .select('content, sender')
        .eq('session_id', sessionId)
        .eq('sender', 'user')
        .order('created_at', { ascending: true })
        .limit(3);

      if (error || !messages || messages.length < 3) {
        return; // Need at least 3 user messages
      }

      // Extract message content
      const userMessages = messages.map(msg => msg.content);
      
      // Generate title with error handling
      try {
        const titleResponse = generateSessionTitle(userMessages);
        if (titleResponse && typeof titleResponse === 'string' && titleResponse.trim() !== "") {
          generatedTitle = titleResponse.trim();
        }
      } catch (titleError) {
        console.error("Error generating title:", titleError);
        // Fallback to default title
      }
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ title: generatedTitle })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session title:', updateError);
        return;
      }

      // Update local state
      updateSessionTitleInState(sessionId, generatedTitle);
      
      // Mark as generated
      setTitleGenerated(prev => new Set(prev).add(sessionId));
      
      console.log('Generated session title:', generatedTitle);
    } catch (error) {
      console.error('Error generating session title:', error);
      // Even if title generation fails, we don't want to break the session
    }
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
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
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
    const text = inputValue.trim();
    if (!text || state.sending) return;
    
    // Check if a session is selected
    if (!selectedSessionId) {
      setError('Please select a session or start a new chat first');
      addToast('Please select a session or start a new chat first', 'error');
      return;
    }
    
    setInputValue('');
    setTyping(true);
    
    try {
      // Store the message content before clearing input
      const messageContent = text;
      
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

      // Step 7: Generate session title after 3rd user message (background operation)
      generateAndUpdateSessionTitle(currentSessionId).catch(error => {
        console.error("Failed to generate session title:", error);
        // Don't show error to user for background operations
      });

    } catch (error) {
      console.error("❌ Chat send error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while sending.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setTyping(false);
    }
  };

  const onAttach = (files: File[]) => {
    // Stub: you can show a preview or upload later.
    console.log('Attached files:', files.map((f) => f.name));
    addToast(`Attached ${files.length} file(s)`, 'info');
  };

  const onLinkChat = () => {
    // Keep your existing link-resource popover/modal; this just triggers it.
    setShowLinkDropdown(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Reset title generation state when switching sessions
    setTitleGenerated(prev => new Set(prev));
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

  const handleDeleteSession = (sessionId: string, sessionTitle: string) => {
    // Set the session to delete and show the modal
    setSessionToDelete({ id: sessionId, title: sessionTitle });
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete || !sessionToDelete.id || typeof sessionToDelete.id !== 'string') {
      console.warn('confirmDeleteSession: invalid sessionToDelete', sessionToDelete);
      return;
    }

    try {
      // Step 1: Delete all messages in the session
      const { error: messagesError } = await supabase
        .from('session_messages')
        .delete()
        .eq('session_id', sessionToDelete.id);

      if (messagesError) {
        console.error('Error deleting session messages:', messagesError);
        addToast('Failed to delete session messages', 'error');
        return;
      }

      // Step 2: Delete the session itself
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionToDelete.id);

      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        addToast('Failed to delete session', 'error');
        return;
      }

      // Step 3: Optimistically update local state
      setSessions((prev) => prev.filter(session => session.id !== sessionToDelete.id));

      // Step 4: If the deleted session was currently selected, clear the selection
      if (selectedSessionId === sessionToDelete.id) {
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
    console.log('[handleNewChat] START');
    console.log('[handleNewChat] user:', user);
    
    // Use selected link data
    const linkType = selectedLinkType || 'general';
    const linkId = selectedLinkId || undefined;
    const linkTitle = selectedLink || '';
    
    console.log('[handleNewChat] link data:', { linkType, linkId, linkTitle });
    
    try {
      // Verify auth & RLS preconditions before insert
      const { data: authSession } = await supabase.auth.getSession();
      console.log('[handleNewChat] authSession:', !!authSession?.session, authSession?.session?.user?.id);

      if (!authSession?.session?.user?.id) {
        console.error('[handleNewChat] No authenticated session found');
        addToast('You are not logged in. Please sign in again.', 'error');
        return;
      }

      // Ensure we use the authenticated user id (matches RLS):
      const uid = authSession.session.user.id;
      console.log('[handleNewChat] RLS expects user_id === auth.uid():', uid);

      // sessions.created_at has default now()
      // sessions.token_count default 0 (or nullable)
      // sessions.word_count default 0 (or nullable)
      const sessionPayload = {
        user_id: uid,
        title: "New Chat"
      };
      
      console.log('[handleNewChat] session payload:', sessionPayload);
      
      // Create new session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .insert(sessionPayload)
        .select()
        .single();

      if (sessionError) {
        console.error('[handleNewChat] Supabase insert error:', {
          message: sessionError.message,
          code: sessionError.code,
          details: sessionError.details,
          hint: sessionError.hint
        });
        throw new Error(`FAILED_CREATE_SESSION: ${sessionError.message}`);
      }

      console.log('[handleNewChat] session created successfully:', sessionData);

      // Set as selected session
      setSelectedSessionId(sessionData.id);
      
      // Clear messages for new session
      setMessages([]);
      
      // Reset title generation state for new session
      setTitleGenerated(prev => new Set(prev));
      
      // Refresh sessions list
      const { data: updatedSessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, title, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('[handleNewChat] Error refreshing sessions:', sessionsError);
      } else {
        console.log('[handleNewChat] sessions refreshed:', updatedSessions?.length || 0, 'sessions');
        setSessions(updatedSessions || []);
      }
      
    } catch (error) {
      console.error('[handleNewChat] crash:', error);
      addToast((error as Error).message || 'Failed to create new session', 'error');
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

      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {/* Left Sidebar - Sessions */}
        <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                  <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
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
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }
                    `}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <MessageCircle className={`w-4 h-4 ${
                        selectedSessionId === session.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
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
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Modern Message List */}
          <MessageList 
            messages={messages.map(msg => ({
              id: msg.id,
              sender: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content,
              created_at: msg.created_at
            }))} 
            typing={typing && state.sending} 
          />

          {/* Error Display */}
          {error && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Modern Chat Input */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            sending={state.sending}
            disabled={!selectedSessionId}
            onLinkChat={onLinkChat}
            onAttach={onAttach}
          />

          {/* Link Dropdown */}
          {showLinkDropdown && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 min-w-[200px] max-h-60 overflow-y-auto">
              {loadingData ? (
                <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">Loading...</div>
              ) : (
                <>
                  {/* Learning Resources */}
                  {learningResources.length > 0 && (
                    <>
                      <div className="px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800">Learning Resources</div>
                      {learningResources.map((resource) => (
                        <button
                          key={resource.id}
                          onClick={() => {
                            setSelectedLink(resource.title);
                            setSelectedLinkId(resource.id);
                            setSelectedLinkType('learning_resource');
                            setShowLinkDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        >
                          📚 {resource.title}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Habits */}
                  {habits.length > 0 && (
                    <>
                      <div className="px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800">Habits</div>
                      {habits.map((habit) => (
                        <button
                          key={habit.id}
                          onClick={() => {
                            setSelectedLink(habit.title);
                            setSelectedLinkId(habit.id);
                            setSelectedLinkType('habit');
                            setShowLinkDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        >
                          🎯 {habit.title}
                        </button>
                      ))}
                    </>
                  )}

                  {/* No items message - only show if both lists are empty */}
                  {learningResources.length === 0 && habits.length === 0 && (
                    <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">No habits or learning resources found</div>
                  )}

                  {/* Remove link option */}
                  {selectedLink && (
                    <>
                      <div className="border-t border-zinc-100 dark:border-zinc-700 my-1"></div>
                      <button
                        onClick={() => {
                          setSelectedLink('');
                          setSelectedLinkId('');
                          setSelectedLinkType('');
                          setShowLinkDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400"
                      >
                        Remove Link
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Linked Item Display */}
          {selectedLink && (
            <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 shadow-lg">
              <span className="text-zinc-600 dark:text-zinc-300">
                {selectedLinkType === 'habit' ? '🎯' : '📚'} Linked to: {selectedLink}
              </span>
              <button
                onClick={() => {
                  setSelectedLink('');
                  setSelectedLinkId('');
                  setSelectedLinkType('');
                }}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                ❌
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSessionToDelete(null);
        }}
        onConfirm={confirmDeleteSession}
        title="Delete this session?"
        message={`This will permanently remove "${sessionToDelete?.title || 'Untitled'}" and all its messages. This action cannot be undone.`}
        confirmText="Delete Session"
        cancelText="Cancel"
      />
    </>
  );
}