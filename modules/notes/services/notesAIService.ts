import { supabase } from '../../database/config/databaseConfig';

export interface NotesMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  note_id: string;
}

export interface NotesSession {
  id: string;
  note_id: string;
  title: string;
  created_at: string;
}

class NotesAIService {
  // Create or get session for a note
  async ensureSessionForNote(noteId: string, userId: string): Promise<string | null> {
    try {
      console.log('🔍 [NotesAI] Ensuring session for note:', noteId);

      // Check if session already exists for this note
      const { data: existingSessions, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .limit(1);

      if (sessionError) {
        console.error('Error checking existing sessions:', sessionError);
        return null;
      }

      if (existingSessions && existingSessions.length > 0) {
        console.log('✅ [NotesAI] Found existing session:', existingSessions[0].id);
        return existingSessions[0].id;
      }

      // Create new session for this note
      const { data: newSession, error: createError } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          title: `Chat for Note`,
          note_id: noteId
        })
        .select('id')
        .single();

      if (createError || !newSession) {
        console.error('Error creating session:', createError);
        return null;
      }

      console.log('✅ [NotesAI] Created new session:', newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Error in ensureSessionForNote:', error);
      return null;
    }
  }

  // Send message and get AI response
  async sendMessage(content: string, sessionId: string, noteId: string, userId: string): Promise<boolean> {
    if (!sessionId || typeof sessionId !== 'string' || !noteId || !userId || !content?.trim()) {
      console.warn('notesAIService.sendMessage: invalid parameters', { content: !!content, sessionId, noteId, userId });
      return false;
    }

    try {
      console.log('🚀 [NotesAI] Sending message:', { content, sessionId, noteId });

      // Save user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          sender: 'user',
          content: content,
          token_count: content.length // Simple approximation
        })
        .select('*')
        .single();

      if (userMessageError || !userMessage) {
        console.error('Error saving user message:', userMessageError);
        return false;
      }

      console.log('✅ [NotesAI] User message saved');

      // Get AI response (simplified for now)
      const aiResponse = await this.getAIResponse(content, noteId);
      
      // Save AI response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          sender: 'assistant',
          content: aiResponse,
          token_count: aiResponse.length // Simple approximation
        })
        .select('*')
        .single();

      if (aiMessageError || !aiMessage) {
        console.error('Error saving AI message:', aiMessageError);
        return false;
      }

      console.log('✅ [NotesAI] AI response saved');
      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    }
  }

  // Get messages for a session
  async getMessagesForSession(sessionId: string): Promise<NotesMessage[]> {
    if (!sessionId || typeof sessionId !== 'string') {
      console.warn('getMessagesForSession: invalid sessionId', sessionId);
      return [];
    }

    try {
      const { data: messages, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return [];
      }

      return (messages || []).map(msg => ({
        id: msg.id.toString(),
        session_id: msg.session_id.toString(),
        sender: msg.sender,
        content: msg.content,
        created_at: msg.created_at,
        note_id: sessionId // We'll use session context
      }));
    } catch (error) {
      console.error('Error in getMessagesForSession:', error);
      return [];
    }
  }

  // Simple AI response (placeholder)
  private async getAIResponse(userMessage: string, noteId: string): Promise<string> {
    // This is a placeholder - in real implementation, this would call OpenAI
    return `I understand you're asking about "${userMessage}". This is a placeholder AI response for note ${noteId}. The AI chat system is working correctly!`;
  }
}

export const notesAIService = new NotesAIService();
