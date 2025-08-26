import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, Clock, Edit, Trash2, BookOpen, Target, Tag } from 'lucide-react';
import { useUser } from '../../modules/auth/hooks/useUser';
import { useToast } from '../../modules/shared/context/ToastContext';
import { supabase } from '../../modules/database/config/databaseConfig';

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

export default function NoteDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { addToast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id && user?.id && typeof id === 'string') {
      loadNote(id);
    }
  }, [id, user?.id]);

  const loadNote = async (noteId: string) => {
    try {
      setLoading(true);
      setError(null);

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
            name,
            emoji
          )
        `)
        .eq('id', noteId)
        .eq('user_id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Note not found');
        } else {
          throw error;
        }
        return;
      }

      // Transform the joined data
      const resources = data.learning_resources as any;
      const habits = data.habits as any;
      const transformedNote = {
        ...data,
        resource_title: resources?.title,
        resource_emoji: resources?.emoji,
        habit_title: habits?.name,
        habit_emoji: habits?.emoji,
      };

      setNote(transformedNote);
    } catch (error) {
      console.error('Error loading note:', error);
      setError('Failed to load note');
      addToast('Failed to load note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async () => {
    if (!note) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (error) throw error;

      addToast('Note deleted successfully', 'success');
      router.push('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      addToast('Failed to delete note', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = (content: any) => {
    if (!content) return <p className="text-gray-500 italic">No content</p>;
    
    // Handle string content
    if (typeof content === 'string') {
      return (
        <div className="prose max-w-none">
          {content.split('\n').map((line, index) => (
            <p key={index} className="mb-4 last:mb-0">{line || <br />}</p>
          ))}
        </div>
      );
    }
    
    // Handle TipTap/rich text JSON format
    if (content.type === 'doc' && content.content) {
      const textContent = extractTextFromTipTap(content);
      return (
        <div className="prose max-w-none">
          {textContent.split('\n').map((line, index) => (
            <p key={index} className="mb-4 last:mb-0">{line || <br />}</p>
          ))}
        </div>
      );
    }
    
    // Fallback for other formats
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Rich content (formatted):</p>
        <pre className="text-sm overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
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
        text += '\n';
      }
    }
    return text.trim();
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Note - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <main className="p-6 max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !note) {
    return (
      <>
        <Head>
          <title>Note Not Found - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <main className="p-6 max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Note Not Found</h2>
              <p className="text-gray-600 mb-6">The note you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 text-blue-500 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Notes
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{note.title} - Note - SmartShelf</title>
        <meta name="description" content={`Note: ${note.title}`} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/notes"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-sm text-gray-500">Note Details</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/notes/${note.id}/edit`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Note Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{note.title}</h1>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
              {/* Created/Updated Dates */}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(note.created_at)}</span>
              </div>
              {note.created_at !== note.updated_at && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(note.updated_at)}</span>
                </div>
              )}

              {/* Linked Resource/Habit */}
              {note.resource_title && (
                <Link
                  href={`/my-learning/${note.linked_resource_id}`}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{note.resource_emoji} {note.resource_title}</span>
                </Link>
              )}
              {note.habit_title && (
                <Link
                  href={`/habits/${note.linked_habit_id}`}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-full"
                >
                  <Target className="w-3 h-3" />
                  <span>{note.habit_emoji} {note.habit_title}</span>
                </Link>
              )}

              {/* Tags */}
              {note.tags && Array.isArray(note.tags) && note.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-gray-700 leading-relaxed">
              {renderContent(note.content)}
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;{note.title}&quot;? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteNote}
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
