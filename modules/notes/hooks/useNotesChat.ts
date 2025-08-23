import { useState, useEffect, useCallback } from 'react';
import { notesAIService, NotesMessage } from '../services/notesAIService';
import { useUser } from '../../auth/hooks/useUser';

export interface NotesChat {
  messages: NotesMessage[];
  loading: boolean;
  sending: boolean;
  sessionId: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  loadMessagesForNote: (noteId: string) => Promise<void>;
}

export function useNotesChat(): NotesChat {
  const [messages, setMessages] = useState<NotesMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const { user } = useUser();

  const loadMessagesForNote = useCallback(async (noteId: string) => {
    if (!user?.id || !noteId) return;

    console.log('📚 [useNotesChat] Loading messages for note:', noteId);
    setLoading(true);

    try {
      // Store the current note ID
      setCurrentNoteId(noteId);
      
      // Ensure session exists for this note
      const ensuredSessionId = await notesAIService.ensureSessionForNote(noteId, user.id);
      if (!ensuredSessionId) {
        console.error('Failed to ensure session for note');
        return;
      }

      setSessionId(ensuredSessionId);

      // Load messages for this session
      const noteMessages = await notesAIService.getMessagesForSession(ensuredSessionId);
      setMessages(noteMessages);
      
      console.log('✅ [useNotesChat] Loaded messages:', noteMessages.length);
    } catch (error) {
      console.error('Error loading messages for note:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    console.log('🎯 [useNotesChat] sendMessage called');
    
    if (!user?.id || !sessionId || !currentNoteId || !content.trim()) {
      console.log('❌ [useNotesChat] Cannot send - missing requirements', {
        hasUser: !!user?.id,
        hasSessionId: !!sessionId,
        hasNoteId: !!currentNoteId,
        hasContent: !!content.trim()
      });
      return false;
    }

    console.log('🚀 [useNotesChat] Sending message:', content);
    setSending(true);

    try {
      // Add optimistic user message
      const optimisticMessage: NotesMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        sender: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
        note_id: currentNoteId
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // Send message through service
      const success = await notesAIService.sendMessage(content.trim(), sessionId, currentNoteId, user.id);

      if (success) {
        // Remove optimistic message and reload all messages to get the real ones + AI response
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        const updatedMessages = await notesAIService.getMessagesForSession(sessionId);
        setMessages(updatedMessages);
        console.log('✅ [useNotesChat] Message sent successfully');
        return true;
      } else {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        console.error('❌ [useNotesChat] Failed to send message');
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setSending(false);
    }
  }, [user?.id, sessionId, currentNoteId]);

  return {
    messages,
    loading,
    sending,
    sessionId,
    sendMessage,
    loadMessagesForNote
  };
}
