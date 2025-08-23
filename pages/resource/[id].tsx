import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { BookOpen, Edit, ArrowLeft } from 'lucide-react';
import BackButton from '../../modules/shared/components/BackButton';
import { useUser } from '../../modules/auth/hooks/useUser';
import { supabase } from '../../modules/database/config/databaseConfig';

interface LearningResource {
  id: string;
  user_id: string;
  emoji: string;
  type: string;
  title: string;
  author?: string;
  duration_minutes: number;
  progress_minutes: number;
  category_tags: string[];
  reminder_date?: string;
  created_at: string;
  updated_at?: string;
}

export default function ResourceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [resource, setResource] = useState<LearningResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    duration: '',
    progress: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadResource = async () => {
      if (!id || !user?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('learning_resources')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading resource:', error);
          setError('Failed to load resource');
        } else {
          setResource(data);
          // Pre-fill edit form
          setEditForm({
            title: data.title,
            author: data.author || '',
            duration: data.duration_minutes.toString(),
            progress: data.progress_minutes.toString(),
          });
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current values
    if (resource) {
      setEditForm({
        title: resource.title,
        author: resource.author || '',
        duration: resource.duration_minutes.toString(),
        progress: resource.progress_minutes.toString(),
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!resource || !user?.id) return;

    // Validate progress cannot exceed duration
    const newProgress = parseInt(editForm.progress);
    const newDuration = parseInt(editForm.duration);
    
    if (newProgress > newDuration) {
      alert('Progress cannot exceed duration');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({
          title: editForm.title,
          author: editForm.author,
          duration_minutes: newDuration,
          progress_minutes: newProgress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resource.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating resource:', error);
        alert('Failed to update resource');
      } else {
        // Update local state
        setResource(prev => prev ? {
          ...prev,
          title: editForm.title,
          author: editForm.author,
          duration_minutes: newDuration,
          progress_minutes: newProgress,
          updated_at: new Date().toISOString(),
        } : null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating resource:', err);
      alert('Failed to update resource');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToMyLearning = () => {
    router.push('/my-learning');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Resource - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50 animate-fadeIn">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-8">
              <BackButton />
              <div className="flex-1">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading resource...</p>
            </div>
          </div>
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
        <div className="min-h-screen bg-gray-50 animate-fadeIn">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-8">
              <BackButton />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Resource Not Found</h1>
              </div>
            </div>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
              <p className="text-gray-600 mb-6">The resource you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <button
                onClick={handleBackToMyLearning}
                className="btn-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Learning
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const progressPercentage = Math.round((resource.progress_minutes / resource.duration_minutes) * 100);

  return (
    <>
      <Head>
        <title>{resource.title} - SmartShelf</title>
        <meta name="description" content={`View details for ${resource.title}`} />
      </Head>
      <div className="min-h-screen bg-gray-50 animate-fadeIn">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Link */}
          <div className="mb-6">
            <button
              onClick={handleBackToMyLearning}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Learning
            </button>
          </div>

          {/* Centered Resource Card */}
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Top Row: Large Emoji, Title, Type */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{resource.emoji}</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                  <span className="capitalize">{resource.type}</span>
                  {resource.author && (
                    <>
                      <span>•</span>
                      <span>by {resource.author}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="text-center mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {resource.progress_minutes} / {resource.duration_minutes} minutes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-center text-sm text-gray-600">
                  {progressPercentage}% complete
                </div>
              </div>

              {/* Tags Section */}
              {resource.category_tags && resource.category_tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.category_tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 text-sm bg-slate-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder Date Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reminder</h3>
                <p className="text-gray-600">
                  {resource.reminder_date 
                    ? `Reminder set for ${new Date(resource.reminder_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`
                    : 'No reminder set'
                  }
                </p>
              </div>

              {/* Created Date Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Created</h3>
                <p className="text-gray-600">
                  Added on {new Date(resource.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  📝 Edit
                </button>
                <button
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={() => alert('Delete functionality coming soon!')}
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  );
} 