import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Clock, BookOpen, Target, Edit, Trash2, FileText } from 'lucide-react';
import { useUser } from '../modules/auth/hooks/useUser';
import { useToast } from '../modules/shared/context/ToastContext';
import { supabase } from '../modules/database/config/databaseConfig';

interface Note {
  id: string;
  user_id: string;
  title: string; 
  content: any; 
  linked_resource_id?: string | null;
  linked_habit_id?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined data
  resource_title?: string;
  resource_emoji?: string;
  habit_title?: string;
  habit_emoji?: string;
}

export default function NotesPage() {
  const { user } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotes();
    }
  }, [user?.id]);

  const loadNotes = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Query notes with joined resource and habit data
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          user_id,
          title,
          content,
          linked_resource_id,
          linked_habit_id,
          tags,
          created_at,
          updated_at,
          learning_resources:linked_resource_id (
            title,
            emoji
          ),
          habits:linked_habit_id (
            title,
            emoji
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the joined data
      const transformedNotes = (data || []).map(note => {
        const resources = note.learning_resources as any;
        const habits = note.habits as any;
        return {
          ...note,
          resource_title: resources?.title,
          resource_emoji: resources?.emoji,
          habit_title: habits?.title,
          habit_emoji: habits?.emoji,
        };
      });

      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      addToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      addToast('Note deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting note:', error);
      addToast('Failed to delete note', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentPreview = (content: any) => {
    if (!content) return 'No content';
    
    // Handle different content formats
    if (typeof content === 'string') {
      return content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }
    
    // Handle TipTap/rich text JSON format
    if (content.type === 'doc' && content.content) {
      const textContent = extractTextFromTipTap(content);
      return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
    }
    
    return 'Rich content';
  };

  const extractTextFromTipTap = (doc: any): string => {
    if (!doc || !doc.content) return '';
    
    let text = '';
    for (const block of doc.content) {
      if (block.content) {
        for (const inline of block.content) {
          if (inline.text) {
            text += inline.text + ' ';
          }
        }
      }
    }
    return text.trim();
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Notes - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <main className="p-6 max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Notes - SmartShelf</title>
        <meta name="description" content="View and manage your learning notes" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <Link
              href="/notes/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Note
            </Link>
          </div>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No notes yet</h2>
              <p className="text-gray-500 mb-6">Add your first insight and start building your knowledge base!</p>
              <Link
                href="/notes/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Note
              </Link>
          </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Note Title */}
                      <Link href={`/notes/${note.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                          {note.title || 'Untitled'}
                        </h3>
                      </Link>
                      
                      {/* Content Preview */}
                      <p className="text-gray-600 mt-2 line-clamp-2">
                        {getContentPreview(note.content)}
                      </p>

                      {/* Linked Resource/Habit */}
                      {(note.resource_title || note.habit_title) && (
                        <div className="flex items-center gap-2 mt-3">
                          {note.resource_title && (
                            <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              <BookOpen className="w-3 h-3" />
                              <span>{note.resource_emoji} {note.resource_title}</span>
                            </div>
                          )}
                          {note.habit_title && (
                            <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                              <Target className="w-3 h-3" />
                              <span>{note.habit_emoji} {note.habit_title}</span>
          </div>
                          )}
              </div>
                      )}

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-3">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(note.updated_at)}</span>
                      </div>
                        </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/notes/${note.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit note"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                              <button
                        onClick={() => setDeleteConfirm(note.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                              </button>
                        </div>
                      </div>
                </div>
              ))}
              </div>
            )}
          </main>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                  onClick={() => deleteNote(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 