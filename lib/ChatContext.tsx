import React, { createContext, useContext, useState, useEffect, useReducer, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useUser } from './useUser';
import { getAIResponse } from './getAIResponse';

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  token_count: number;
  word_count: number;
  link_type?: 'habit' | 'learning_resource' | 'general';
  link_id?: string;
  link_title?: string;
  linked_habit?: string;
  linked_learning_resource?: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  token_count: number;
}

interface ChatState {
  sessions: Session[];
  currentSession: Session | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
}

type ChatAction = 
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'SET_CURRENT_SESSION'; payload: Session | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_SESSION_TITLE'; payload: { sessionId: string; title: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean };

const ChatContext = createContext<{
  state: ChatState;
  sendMessage: (content: string) => Promise<boolean>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: (linkType?: 'habit' | 'learning_resource' | 'general', linkId?: string, linkTitle?: string) => Promise<void>;
  generateSessionTitle: (sessionId: string) => Promise<void>;
} | null>(null);

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_SESSION_TITLE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? { ...session, title: action.payload.title }
            : session
        ),
        currentSession: state.currentSession?.id === action.payload.sessionId
          ? { ...state.currentSession, title: action.payload.title }
          : state.currentSession
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_SENDING':
      return { ...state, sending: action.payload };
    
    default:
      return state;
  }
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    sessions: [],
    currentSession: null,
    messages: [],
    loading: false,
    sending: false
  });
  const { user } = useUser();

  // Load sessions when user is available
  useEffect(() => {
    if (!user?.id) return;

    const loadSessions = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading sessions:', error);
          return;
        }

        dispatch({ type: 'SET_SESSIONS', payload: data || [] });
      } catch (err) {
        console.error('Error loading sessions:', err);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSessions();
  }, [user?.id]);

  // Create new session
  const createNewSession = async (linkType?: 'habit' | 'learning_resource' | 'general', linkId?: string, linkTitle?: string) => {
    if (!user?.id) return;

    try {
      const sessionData: any = {
        user_id: user.id,
        title: 'Untitled Session',
        link_type: linkType || 'general',
        link_id: linkId,
        link_title: linkTitle,
        token_count: 0,
        word_count: 0
      };

      // Set specific link fields based on type
      if (linkType === 'habit' && linkId) {
        sessionData.linked_habit = linkId;
      } else if (linkType === 'learning_resource' && linkId) {
        sessionData.linked_learning_resource = linkId;
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return;
      }

      const newSession = {
        ...data,
        id: data.id.toString()
      };

      dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ type: 'SET_SESSIONS', payload: [newSession, ...state.sessions] });
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  // Load session messages
  const loadSession = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      // Load session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError) {
        console.error('Error loading session:', sessionError);
        return;
      }

      const session = {
        ...sessionData,
        id: sessionData.id.toString()
      };

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return;
      }

      const messages = (messagesData || []).map(msg => ({
        ...msg,
        id: msg.id.toString(),
        session_id: msg.session_id.toString()
      }));

      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (err) {
      console.error('Error loading session:', err);
    }
  };

  // Send message to OpenAI and save to database
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!user?.id || !content.trim()) return false;

    console.log('🚀 [sendMessage] Starting message flow with content:', content);
    dispatch({ type: 'SET_SENDING', payload: true });

    try {
      // Use the new getAIResponse function which handles session creation and AI response
      console.log('🤖 [sendMessage] Calling getAIResponse function...');
      const result = await getAIResponse(content, state.messages);
      
      console.log('✅ [sendMessage] getAIResponse completed successfully');
      console.log('📊 [sendMessage] Result:', result);

      // Create session object for state
      const session = {
        id: result.sessionId,
        title: 'New Chat Session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        token_count: 0,
        word_count: 0,
        link_type: 'general' as const
      };

      // Update state with new session and messages
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
      dispatch({ type: 'SET_SESSIONS', payload: [session, ...state.sessions] });

      // Create message objects for state
      const userMessageData = {
        id: `temp-${Date.now()}-user`,
        session_id: result.sessionId,
        sender: 'user' as const,
        content: content.trim(),
        created_at: new Date().toISOString(),
        token_count: 0
      };

      const aiMessageData = {
        id: `temp-${Date.now()}-ai`,
        session_id: result.sessionId,
        sender: 'assistant' as const,
        content: result.aiResponse,
        created_at: new Date().toISOString(),
        token_count: 0
      };

      // Dispatch messages to state
      dispatch({ type: 'ADD_MESSAGE', payload: userMessageData });
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessageData });

      console.log('🎉 [sendMessage] Message flow completed successfully');
      console.log('📊 [sendMessage] Final state:', {
        sessionId: result.sessionId,
        userMessage: userMessageData.id,
        aiMessage: aiMessageData.id,
        totalMessages: state.messages.length + 2
      });

      return true; // Success
    } catch (err) {
      console.error("❌ sendMessage crashed:", err);
      throw err; // Re-throw to let UI handle the error
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
    }
  };

  // Get response from OpenAI API


  // Generate session title using AI (simulated for now)
  const generateSessionTitle = async (sessionId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a simple title based on message content
      const recentMessages = state.messages.slice(-4);
      const content = recentMessages.map(msg => msg.content).join(' ').toLowerCase();
      
      let title = 'Learning Discussion';
      
      if (content.includes('book') || content.includes('summary')) {
        title = 'Book Summary';
      } else if (content.includes('study') || content.includes('plan')) {
        title = 'Study Planning';
      } else if (content.includes('habit') || content.includes('routine')) {
        title = 'Habit Building';
      } else if (content.includes('note') || content.includes('organize')) {
        title = 'Note Organization';
      }
      
      // Update session title in database
      const { error } = await supabase
        .from('sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session title:', error);
        return;
      }

      dispatch({ type: 'UPDATE_SESSION_TITLE', payload: { sessionId, title } });
    } catch (error) {
      console.error('Error generating title:', error);
    }
  };

  return (
    <ChatContext.Provider value={{
      state,
      sendMessage,
      loadSession,
      createNewSession,
      generateSessionTitle
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};