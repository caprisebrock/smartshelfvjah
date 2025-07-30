import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MessageCircle, Plus, Send, Bot, User, Loader2, ArrowLeft, AlertCircle, BookOpen, FileText, Target, ChevronDown, Settings } from 'lucide-react';
import { useChat } from '../lib/ChatContext';
import { useUser } from '../lib/useUser';
import { useToast } from '../lib/ToastContext';
import { supabase } from '../lib/supabaseClient';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

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
    if (!inputValue.trim() || state.sending) return;

    const message = inputValue.trim();
    setError(null);
    console.log('🚀 handleSendMessage called with:', message);

    try {
      console.log('📤 Calling sendMessage...');
      const success = await sendMessage(message);
      console.log('📥 sendMessage returned:', success);
      if (success) {
        // Only clear input on successful send
        setInputValue('');
        console.log('✅ Input cleared, message sent successfully');
        addToast('Message sent successfully! 🤖', 'success');
      }
    } catch (err) {
      console.error('❌ Error in handleSendMessage:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not get response. Please try again.';
      setError(errorMessage);
      
      // Show specific error messages based on the error
      if (errorMessage.includes('Could not create session')) {
        addToast('Could not create session', 'error');
      } else if (errorMessage.includes('Could not save user message')) {
        addToast('Could not save user message', 'error');
      } else if (errorMessage.includes('Could not save AI reply')) {
        addToast('Could not save AI reply', 'error');
      } else if (errorMessage.includes('AI failed to respond')) {
        addToast('AI failed to respond', 'error');
      } else {
        addToast('Something went wrong', 'error');
      }
      
      // Don't clear input on error - let user retry
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSessionClick = (sessionId: string) => {
    loadSession(sessionId);
  };

  const handleNewChat = () => {
    // Use selected link data
    const linkType = selectedLinkType || 'general';
    const linkId = selectedLinkId || undefined;
    const linkTitle = selectedLink || '';
    
    createNewSession(linkType as any, linkId, linkTitle);
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
            {state.loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Render grouped sessions */}
                {Object.entries(groupedSessions).map(([linkType, sessions]) => {
                  if (sessions.length === 0) return null;
                  
                  return (
                    <div key={linkType} className="space-y-2">
                      <div className="flex items-center gap-2 px-2 py-1">
                        {getLinkTypeIcon(linkType)}
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {getLinkTypeName(linkType)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            onClick={() => handleSessionClick(session.id)}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                              ${state.currentSession?.id === session.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-600'
                              }
                            `}
                          >
                            <MessageCircle className={`w-4 h-4 ${
                              state.currentSession?.id === session.id ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate">{session.title || 'Untitled'}</span>
                              {session.linked_learning_resource && (
                                <div className="text-xs text-gray-400 truncate">
                                  📚 Linked resource
                                </div>
                              )}
                              {session.linked_habit && (
                                <div className="text-xs text-gray-400 truncate">
                                  🎯 Linked habit
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {state.sessions.length === 0 && (
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
            {state.currentSession && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="font-medium">{state.currentSession.title}</span>
                {state.currentSession.linked_learning_resource && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    📚 Linked to learning resource
                  </span>
                )}
                {state.currentSession.linked_habit && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    🎯 Linked to habit
                  </span>
                )}
              </div>
            )}

            {state.messages.length === 0 && !state.sending && !state.currentSession && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="text-sm">No chat selected</p>
                </div>
              </div>
            )}

            {state.messages.map((message) => {
              console.log('🎨 Rendering message:', message);
              return (
                <div key={message.id} className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  {message.sender === 'assistant' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`flex-1 ${message.sender === 'user' ? 'max-w-3xl flex justify-end' : ''}`}>
                    <div className={`
                      px-4 py-3 rounded-2xl shadow-sm max-w-2xl
                      ${message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-md'
                        : 'bg-white border border-gray-200 rounded-tl-md'
                      }
                    `}>
                      <p className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {state.sending && (
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
                    disabled={state.sending}
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || state.sending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {state.sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {state.sending ? 'Sending...' : 'Send'}
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