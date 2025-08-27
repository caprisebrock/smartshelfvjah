import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, FileText, Clock, Trash2 } from 'lucide-react';
import { useUser } from '../../modules/auth/hooks/useUser';
import { useToast } from '../../modules/shared/context/ToastContext';
import { getLearningResourceById, deleteLearningResource, LearningResource } from '../../modules/learning-resources/api/getLearningResourceById';
import { supabase } from '../../modules/database/config/databaseConfig';
import ConfirmDeleteModal from '../../modules/shared/components/ConfirmDeleteModal';


export default function LearningResourceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const { addToast } = useToast();
  const [resource, setResource] = useState<LearningResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressToAdd, setProgressToAdd] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [linkedNotes, setLinkedNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; resourceId: string | null; resourceTitle: string }>({
    isOpen: false,
    resourceId: null,
    resourceTitle: ''
  });


  useEffect(() => {
    const loadResource = async () => {
      if (!id || !user?.id || typeof id !== 'string') return;

      setLoading(true);
      setError(null);

      try {
        const data = await getLearningResourceById(id, user.id);
        if (data) {
          setResource(data);
          // Load linked notes after resource is loaded
          loadLinkedNotes(id);
        } else {
          setError('Resource not found');
        }
      } catch (err) {
        console.error('Error loading resource:', err);
        setError('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id, user?.id]);

  const loadLinkedNotes = async (resourceId: string) => {
    if (!user?.id) return;
    
    try {
      setLoadingNotes(true);
      
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('linked_resource_id', resourceId)
        .order('updated_at', { ascending: false })
        .limit(5); // Show only the 5 most recent notes

      if (error) throw error;
      
      setLinkedNotes(data || []);
    } catch (error) {
      console.error('Error loading linked notes:', error);
      // Don't show error toast for notes - it's not critical
    } finally {
      setLoadingNotes(false);
    }
  };

  const getContentPreview = (content: any) => {
    if (!content) return 'No content';
    
    // Handle different content formats
    if (typeof content === 'string') {
      return content.substring(0, 80) + (content.length > 80 ? '...' : '');
    }
    
    // Handle TipTap/rich text JSON format
    if (content.type === 'doc' && content.content) {
      const textContent = extractTextFromTipTap(content);
      return textContent.substring(0, 80) + (textContent.length > 80 ? '...' : '');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    if (resource) {
      router.push(`/my-learning/edit/${resource.id}`);
    }
  };

  const openDeleteModal = () => {
    if (!resource) return;
    setDeleteModal({
      isOpen: true,
      resourceId: resource.id,
      resourceTitle: resource.title
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.resourceId || !user?.id) return;

    try {
      const success = await deleteLearningResource(deleteModal.resourceId, user.id);
      if (success) {
        addToast('Learning resource deleted successfully', 'success');
        router.push('/my-learning');
      } else {
        addToast('Failed to delete resource', 'error');
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
      addToast('Failed to delete resource', 'error');
    }
  };

  const formatReminderDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleAddProgress = async () => {
    if (!progressToAdd || progressToAdd <= 0 || !resource || !user?.id) return;

    setIsUpdating(true);

    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .update({
          progress_minutes: (resource.progress_minutes || 0) + progressToAdd
        })
        .eq('id', resource.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating progress:', error);
        addToast("Failed to update progress", "error");
      } else {
        addToast("Progress added!", "success");
        // Update local state optimistically
        setResource(prev => prev ? {
          ...prev,
          progress_minutes: (prev.progress_minutes || 0) + progressToAdd
        } : null);
        router.replace(router.asPath); // Refresh UI without redirecting
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      addToast("Failed to update progress", "error");
    }

    setProgressToAdd(0);
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Resource - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <main className="p-6 max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !resource) {
    return (
      <>
        <Head>
          <title>Resource Not Found - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <main className="p-6 max-w-3xl mx-auto">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
              <p className="text-gray-600 mb-6">The resource you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <button
                onClick={() => router.push('/my-learning')}
                className="flex items-center gap-2 text-blue-500 hover:underline mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Learning
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{resource.title} - SmartShelf</title>
        <meta name="description" content={`View details for ${resource.title}`} />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button 
              className="flex items-center text-blue-500 hover:underline" 
              onClick={() => router.push('/my-learning')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Learning
            </button>
            <div className="flex gap-2">
              <button 
                className="text-sm text-gray-600 hover:text-red-500 flex items-center gap-1" 
                onClick={openDeleteModal}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button 
                className="text-sm text-blue-600 hover:underline" 
                onClick={handleEdit}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{resource.emoji}</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{resource.title}</h1>
                <p className="text-sm text-gray-500">
                  {resource.type}
                  {resource.author && ` · ${resource.author}`}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Duration:</strong> {resource.duration_minutes} minutes</p>
              <p><strong>Progress:</strong> {resource.progress_minutes} minutes</p>
              {resource.reminder_date && (
                <p><strong>Reminder:</strong> {formatReminderDate(resource.reminder_date)}</p>
              )}
              
              {/* Progress Bar */}
              <div className="mt-4 mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((resource.progress_minutes / resource.duration_minutes) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((resource.progress_minutes / resource.duration_minutes) * 100)}%` }}
                  />
                </div>
              </div>


            </div>

            {resource.category_tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.category_tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {resource.reflection && (
              <div>
                <h2 className="text-sm font-medium text-gray-800 mb-1">Reflection</h2>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{resource.reflection}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Progress</h3>
              <input
                type="number"
                value={progressToAdd || ''}
                onChange={(e) => setProgressToAdd(Number(e.target.value) || 0)}
                placeholder="Add minutes"
                min="0"
                className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              />
              <button
                onClick={handleAddProgress}
                disabled={isUpdating || !progressToAdd || progressToAdd <= 0}
                className="mt-2 w-full bg-emerald-500 text-white text-sm font-medium py-2 px-4 rounded hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Adding...' : 'Add Progress'}
              </button>
            </div>

            <div className="pt-4 border-t mt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-800">Linked Notes</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/notes/new?resource_id=${resource?.id}`)}
                    className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Note
                  </button>
                  <button
                    onClick={() => router.push('/notes')}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
              </div>

              {loadingNotes ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : linkedNotes.length > 0 ? (
                <div className="space-y-2">
                  {linkedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/notes/${note.id}`)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {note.title || 'Untitled'}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {getContentPreview(note.content)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(note.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {linkedNotes.length === 5 && (
                    <button
                      onClick={() => router.push(`/notes?filter=resource:${resource?.id}`)}
                      className="w-full text-xs text-blue-600 hover:underline py-2"
                    >
                      View all notes for this resource
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No notes yet for this resource</p>
                  <button
                    onClick={() => router.push(`/notes/new?resource_id=${resource?.id}`)}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Add your first note
                  </button>
                </div>
              )}
            </div>

            {/* Debug content to test scrolling */}
            <div className="mt-8 p-4 bg-green-50 rounded text-sm text-green-800">
              🔧 Debug: Resource detail page scroll test. If you can see this message, scrolling is working on this page!
            </div>
          </div>
        </main>

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, resourceId: null, resourceTitle: '' })}
          onConfirm={handleDelete}
          title="Delete this learning resource?"
          description="This will permanently remove the resource and all its progress data."
          itemName={deleteModal.resourceTitle}
        />
      </div>
    </>
  );
}
