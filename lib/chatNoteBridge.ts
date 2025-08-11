import { supabase } from './supabaseClient';
import { Note } from './notes';

// Ensures there's exactly one session for a given note/user, returns it.
export async function getOrCreateNoteSession(noteId: string): Promise<{ id: string, title: string }> {
  // 1) Try select sessions where note_id = noteId and user_id = current user
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth?.session?.user?.id;
  if (!uid) throw new Error('Not authenticated');

  // Try to find existing session for this note
  const { data: existingSession, error: findError } = await supabase
    .from('sessions')
    .select('id, title')
    .eq('user_id', uid)
    .eq('note_id', noteId)
    .limit(1)
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Failed to find note session: ${findError.message}`);
  }

  if (existingSession) {
    return { id: existingSession.id, title: existingSession.title };
  }

  // 2) If none, create one with title = "Note: " + (note.title || "Untitled")
  // First get the note title
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('title')
    .eq('id', noteId)
    .eq('user_id', uid)
    .single();

  if (noteError) {
    throw new Error(`Failed to get note: ${noteError.message}`);
  }

  const sessionTitle = `Note: ${note.title || 'Untitled'}`;

  // Create new session
  const { data: newSession, error: createError } = await supabase
    .from('sessions')
    .insert({
      user_id: uid,
      note_id: noteId,
      title: sessionTitle,
      token_count: 0,
      word_count: 0
    })
    .select('id, title')
    .single();

  if (createError) {
    throw new Error(`Failed to create note session: ${createError.message}`);
  }

  return { id: newSession.id, title: newSession.title };
}

// Returns all messages for a session ordered by created_at asc
export async function getSessionMessages(sessionId: string) {
  const { data: messages, error } = await supabase
    .from('session_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get session messages: ${error.message}`);
  }

  return messages || [];
} 