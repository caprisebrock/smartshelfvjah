import { supabase } from './supabaseClient';

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: any; // TipTap/Slate JSON
  linked_resource_id?: string | null;
  created_at: string;
  updated_at: string;
};

export async function getNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('id, user_id, title, content, linked_resource_id, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as Note[];
}

export async function updateNote(params: { id: string; title?: string; content?: any; linked_resource_id?: string | null }) {
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (typeof params.title !== 'undefined') updates.title = params.title;
  if (typeof params.content !== 'undefined') updates.content = params.content;
  if (typeof params.linked_resource_id !== 'undefined') updates.linked_resource_id = params.linked_resource_id;

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Note;
}

export async function deleteNote(id: string) {
  // Try cascading delete (if FK set), otherwise manual cleanup is handled server-side or via DB constraints
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Debounced update function for autosave (600ms delay)
let debounceTimers: Record<string, NodeJS.Timeout> = {};

export function debouncedUpdateNote(
  noteId: string, 
  updates: Partial<Pick<Note, 'title' | 'content'>>,
  delay: number = 600
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Clear existing timer for this note
    if (debounceTimers[noteId]) {
      clearTimeout(debounceTimers[noteId]);
    }

    // Set new timer
    debounceTimers[noteId] = setTimeout(async () => {
      try {
        await updateNote({ id: noteId, ...updates });
        resolve();
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

// Flush pending updates for a specific note (used when switching notes)
export function flushNoteUpdates(noteId: string): void {
  if (debounceTimers[noteId]) {
    clearTimeout(debounceTimers[noteId]);
    delete debounceTimers[noteId];
  }
}

// Lightweight helpers for fast note operations
export async function createNote(userId: string) {
  const { data, error } = await supabase.from('notes')
    .insert([{ user_id: userId, title: 'Untitled', content: {} }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getNoteById(id: string) {
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updateNoteFast(id: string, patch: { title?: string; content?: any }) {
  const { data, error } = await supabase.from('notes')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNoteById(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

// Get or create exactly one session per note
export async function getOrCreateNoteSession(noteId: string): Promise<{ id: string; title: string; note_id: string }> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth?.session?.user?.id;
  if (!uid) throw new Error('Not authenticated');

  // Try to find existing session for this note
  const { data: existingSession, error: findError } = await supabase
    .from('sessions')
    .select('id, title, note_id')
    .eq('user_id', uid)
    .eq('note_id', noteId)
    .limit(1)
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Failed to find note session: ${findError.message}`);
  }

  if (existingSession) {
    return existingSession;
  }

  // Create new session if none exists
  const { data: newSession, error: createError } = await supabase
    .from('sessions')
    .insert({
      user_id: uid,
      title: 'New Note Chat',
      note_id: noteId,
      token_count: 0,
      word_count: 0
    })
    .select('id, title, note_id')
    .single();

  if (createError) {
    throw new Error(`Failed to create note session: ${createError.message}`);
  }

  return newSession;
}

export type SessionRow = {
  id: string;
  user_id: string;
  title: string;
  note_id?: string | null;
  created_at: string;
  updated_at: string;
};