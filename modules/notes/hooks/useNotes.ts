// EXTRACT AND CREATE THIS HOOK FROM: lib/notes.ts
// Create a custom hook that provides access to notes data and operations
// This should wrap the notes functionality and provide a clean API for components 
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../auth/hooks/useUser';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  quickCreateNote,
  debouncedUpdateNote,
  flushNoteUpdates,
  getNoteById,
  updateNoteFast,
  deleteNoteById,
  getOrCreateNoteSession,
  type Note
} from '../services/notesService';

export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (params: { title?: string; linked_resource_id?: string | null }) => Promise<Note>;
  updateNote: (params: { id: string; title?: string; content?: any; linked_resource_id?: string | null }) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  quickCreateNote: (userId: string) => Promise<Note>;
  debouncedUpdateNote: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>, delay?: number) => Promise<void>;
  flushNoteUpdates: (noteId: string) => Promise<void>;
  getNoteById: (id: string) => Promise<Note | null>;
  updateNoteFast: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<Note>;
  deleteNoteById: (id: string) => Promise<void>;
  getOrCreateNoteSession: (noteId: string) => Promise<any>;
  refreshNotes: () => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const { user } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotes = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const notesData = await getNotes(user.id);
      setNotes(notesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  const createNoteHandler = useCallback(async (params: { title?: string; linked_resource_id?: string | null }) => {
    try {
      const newNote = await createNote(params);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  }, []);

  const updateNoteHandler = useCallback(async (params: { id: string; title?: string; content?: any; linked_resource_id?: string | null }) => {
    try {
      const updatedNote = await updateNote(params);
      setNotes(prev => prev.map(note => note.id === params.id ? updatedNote : note));
      return updatedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  }, []);

  const deleteNoteHandler = useCallback(async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  }, []);

  const quickCreateNoteHandler = useCallback(async (userId: string) => {
    try {
      const newNote = await quickCreateNote(userId);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  }, []);

  const debouncedUpdateNoteHandler = useCallback(async (noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>, delay?: number) => {
    try {
      await debouncedUpdateNote(noteId, updates, delay);
      // Update local state optimistically
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  }, []);

  const flushNoteUpdatesHandler = useCallback(async (noteId: string) => {
    try {
      await flushNoteUpdates(noteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flush note updates');
      throw err;
    }
  }, []);

  const getNoteByIdHandler = useCallback(async (id: string) => {
    try {
      return await getNoteById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get note');
      throw err;
    }
  }, []);

  const updateNoteFastHandler = useCallback(async (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    try {
      const updatedNote = await updateNoteFast(id, updates);
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      return updatedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  }, []);

  const deleteNoteByIdHandler = useCallback(async (id: string) => {
    try {
      await deleteNoteById(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  }, []);

  const getOrCreateNoteSessionHandler = useCallback(async (noteId: string) => {
    try {
      return await getOrCreateNoteSession(noteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get or create note session');
      throw err;
    }
  }, []);

  return {
    notes,
    loading,
    error,
    createNote: createNoteHandler,
    updateNote: updateNoteHandler,
    deleteNote: deleteNoteHandler,
    quickCreateNote: quickCreateNoteHandler,
    debouncedUpdateNote: debouncedUpdateNoteHandler,
    flushNoteUpdates: flushNoteUpdatesHandler,
    getNoteById: getNoteByIdHandler,
    updateNoteFast: updateNoteFastHandler,
    deleteNoteById: deleteNoteByIdHandler,
    getOrCreateNoteSession: getOrCreateNoteSessionHandler,
    refreshNotes
  };
} 