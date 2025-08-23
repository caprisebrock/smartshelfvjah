// COPY THIS ENTIRE FILE FROM: lib/ChatContext.tsx
// Move the complete contents of lib/ChatContext.tsx into this file 
import React, { createContext, useContext, useState, useEffect, useReducer, ReactNode } from 'react';
import { supabase } from '../../database/config/databaseConfig';
import { useUser } from '../../auth/hooks/useUser';
import { getAIResponse } from '../services/getAIResponse';

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  token_count: number;
  word_count: number;
  note_id?: string | null;
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
  createNewSession: (linkType?: 'habit' | 'learning_resource' | 'general' | 'note', linkId?: string, linkTitle?: string, noteId?: string) => Promise<void>;
  ensureNoteSession: (noteId: string) => Promise<string | null>;
  generateSessionTitle: (sessionId: string) => Promise<void>;
  setCurrentSessionId: (sessionId: string) => Promise<void>;
  openNoteChat: (noteId: string) => Promise<void>;
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
          .order('created_at', { ascending: false });

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
  const createNewSession = async (linkType?: 'habit' | 'learning_resource' | 'general' | 'note', linkId?: string, linkTitle?: string, noteId?: string) => {
    console.log('[createNewSession] START');
    console.log('[createNewSession] user:', user);
    
    if (!user?.id) {
      console.error('[createNewSession] No user ID available');
      return;
    }

    try {
      // Verify auth & RLS preconditions before insert
      const { data: authSession } = await supabase.auth.getSession();
      console.log('[createNewSession] authSession:', !!authSession?.session, authSession?.session?.user?.id);

      if (!authSession?.session?.user?.id) {
        console.error('[createNewSession] No authenticated session found');
        // Note: We don't have access to addToast here, so we'll throw an error
        // The calling component should handle displaying the error to the user
        throw new Error('You are not logged in. Please sign in again.');
      }

      // Ensure we use the authenticated user id (matches RLS):
      const uid = authSession.session.user.id;
      console.log('[createNewSession] RLS expects user_id === auth.uid():', uid);

      // sessions.created_at has default now()
      // sessions.token_count default 0 (or nullable)
      // sessions.word_count default 0 (or nullable)
      const payload: Record<string, any> = {
        user_id: uid,
        title: 'New Chat'
      };
      if (noteId) payload.note_id = noteId;

      console.log('[createNewSession] payload:', payload);

      const { data, error } = await supabase
        .from('sessions')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('[createNewSession] Supabase insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`FAILED_CREATE_SESSION: ${error.message}`);
      }

      console.log('[createNewSession] success:', data);

      if (data) {
        localStorage.setItem('currentSessionId', data.id);
      }

      // Normalize the returned row id to string and push to state
      const newSession = { ...data, id: String(data.id) };
      dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ type: 'SET_SESSIONS', payload: [newSession, ...state.sessions] });
    } catch (err) {
      console.error('[createNewSession] crash:', err);
      // Note: We don't have access to addToast here, so we'll log the error
      // The calling component should handle displaying the error to the user
      throw err; // Re-throw to let the calling component handle it
    }
  };

  // Ensure there is a session for a given note, set it current, and load messages
  const ensureNoteSession = async (noteId: string): Promise<string | null> => {
    if (!user?.id) return null;
    try {
      const { data: authSession } = await supabase.auth.getSession();
      if (!authSession?.session?.user?.id) return null;
      const uid = authSession.session.user.id;

      // Try to find existing
      const { data: existing, error: findErr } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', uid)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let targetSession = existing;
      if (!existing) {
        const { data: created, error: cErr } = await supabase
          .from('sessions')
          .insert({ user_id: uid, title: 'Untitled Chat', note_id: noteId })
          .select('*')
          .single();
        if (cErr) throw cErr;
        targetSession = created;
      } else if (findErr && (findErr as any).code !== 'PGRST116') {
        console.error('ensureNoteSession find error', findErr);
      }

      if (!targetSession) return null;

      const normalized = { ...targetSession, id: String(targetSession.id) } as Session;
      localStorage.setItem('currentSessionId', normalized.id);
      dispatch({ type: 'SET_CURRENT_SESSION', payload: normalized });

      // Load messages for this session
      const { data: messagesData, error: messagesError } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', normalized.id)
        .order('created_at', { ascending: true });
      if (!messagesError) {
        const messages = (messagesData || []).map(msg => ({
          ...msg,
          id: msg.id.toString(),
          session_id: msg.session_id.toString()
        }));
        dispatch({ type: 'SET_MESSAGES', payload: messages });
      }

      // Add to sessions list if not present
      const existsInState = state.sessions.some(s => s.id === normalized.id);
      if (!existsInState) {
        dispatch({ type: 'SET_SESSIONS', payload: [normalized, ...state.sessions] });
      }

      return normalized.id;
    } catch (e) {
      console.error('ensureNoteSession error', e);
      return null;
    }
  };

  // Load session messages
  const loadSession = async (sessionId: string) => {
    if (!sessionId || typeof sessionId !== 'string') {
      console.warn('Skipping loadSession: invalid sessionId', sessionId);
      return;
    }
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
      // First, check if we have a current session in local state
      let sessionId: string | null = state.currentSession?.id || null;

      // If no current session in state, check localStorage
      if (!sessionId) {
        sessionId = localStorage.getItem('currentSessionId');
      }

      // If still no session, create a new one
      if (!sessionId) {
        console.log('📝 [sendMessage] Creating new session...');
        console.log('[sendMessage] user:', user);
        
        // Verify auth & RLS preconditions before insert
        const { data: authSession } = await supabase.auth.getSession();
        console.log('[sendMessage] authSession:', !!authSession?.session, authSession?.session?.user?.id);

        if (!authSession?.session?.user?.id) {
          console.error('[sendMessage] No authenticated session found');
          return false;
        }

        // Ensure we use the authenticated user id (matches RLS):
        const uid = authSession.session.user.id;
        console.log('[sendMessage] RLS expects user_id === auth.uid():', uid);

        // sessions.created_at has default now()
        // sessions.token_count default 0 (or nullable)
        // sessions.word_count default 0 (or nullable)
        const payload = {
          user_id: uid,
          title: 'New Chat'
        };

        console.log('[sendMessage] session payload:', payload);

        const { data, error: sessionError } = await supabase
          .from('sessions')
          .insert(payload)
          .select()
          .single();

        if (sessionError) {
          console.error('[sendMessage] Supabase insert error:', {
            message: sessionError.message,
            code: sessionError.code,
            details: sessionError.details,
            hint: sessionError.hint
          });
          return false;
        }

        console.log('[sendMessage] session created successfully:', data);

        sessionId = data.id;
        localStorage.setItem('currentSessionId', sessionId as string);
        
        // Normalize the returned row id to string and push to state
        const newSession = { ...data, id: String(data.id) };
        dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
        dispatch({ type: 'SET_SESSIONS', payload: [newSession, ...state.sessions] });
      }

      // Ensure sessionId is not null at this point
      if (!sessionId) {
        console.error('Failed to get or create session ID');
        return false;
      }

      // Use sessionId for inserting message
      await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId as string,
          sender: 'user',
          content: content.trim(),
          token_count: 0
        });

      // Create message object for state
      const userMessageData = {
        id: `temp-${Date.now()}-user`,
        session_id: sessionId as string,
        sender: 'user' as const,
        content: content.trim(),
        created_at: new Date().toISOString(),
        token_count: 0
      };

      // Dispatch user message to state
      dispatch({ type: 'ADD_MESSAGE', payload: userMessageData });

      // Get AI response using getAIResponse function with session context
      console.log('🤖 [sendMessage] Getting AI response with session context...');
      const result = await getAIResponse(content, state.messages.slice(-20), sessionId as string);
      const aiResponse = result.aiResponse;

      // Create AI message object for state
      const aiMessageData = {
        id: `temp-${Date.now()}-ai`,
        session_id: sessionId as string,
        sender: 'assistant' as const,
        content: aiResponse,
        created_at: new Date().toISOString(),
        token_count: 0
      };

      // Dispatch AI message to state
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessageData });

      // Save assistant message to Supabase
      await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId as string,
          sender: 'assistant',
          content: aiResponse,
          token_count: 0
        });

      console.log('🎉 [sendMessage] Message flow completed successfully');
      console.log('📊 [sendMessage] Final state:', {
        sessionId: sessionId,
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
    if (!sessionId || typeof sessionId !== 'string') {
      console.warn('Skipping generateSessionTitle: invalid sessionId', sessionId);
      return;
    }

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

  // Set current session by ID and load its messages
  const setCurrentSessionId = async (sessionId: string) => {
    if (!user?.id) return;

    try {
      // Find the session in the current sessions list
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
      }

      // Load messages for this session using existing logic
      await loadSession(sessionId);
    } catch (error) {
      console.error('Error setting current session:', error);
    }
  };

  // Open a chat session for a specific note
  const openNoteChat = async (noteId: string) => {
    if (!user?.id) return;

    try {
      // Ensure a session exists for the note
      const sessionId = await ensureNoteSession(noteId);

      if (sessionId) {
        // Set the session as current
        await setCurrentSessionId(sessionId);
      } else {
        // If no session exists, create a new one
        await createNewSession('note', undefined, undefined, noteId);
        // After creating a new session, set it as current
        const newSessionId = localStorage.getItem('currentSessionId');
        if (newSessionId) {
          await setCurrentSessionId(newSessionId);
        }
      }
    } catch (error) {
      console.error('Error opening note chat:', error);
    }
  };

  return (
    <ChatContext.Provider value={{
      state,
      sendMessage,
      loadSession,
      createNewSession,
      ensureNoteSession,
      generateSessionTitle,
      setCurrentSessionId,
      openNoteChat
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