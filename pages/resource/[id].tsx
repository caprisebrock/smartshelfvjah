import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { BookOpen, Edit, ArrowLeft } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { useUser } from '../../lib/useUser';
import { supabase } from '../../lib/supabaseClient';

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
  created_at: string;
  updated_at: string;
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
        <div className="min-h-screen bg-white animate-fadeIn">
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
        <div className="min-h-screen bg-white animate-fadeIn">
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
              <p className="text-gray-600 mb-6">The resource you're looking for doesn't exist or you don't have permission to view it.</p>
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
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Resource Details</h1>
              </div>
              <p className="text-gray-600">View and manage your learning resource</p>
            </div>
          </div>

          {/* Resource Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-4xl">
                {resource.emoji}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                        placeholder="Resource title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Author</label>
                      <input
                        type="text"
                        value={editForm.author}
                        onChange={(e) => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                        className="input-field"
                        placeholder="Author name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.duration}
                          onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                          className="input-field"
                          placeholder="Total duration"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Progress (minutes)</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.progress}
                          onChange={(e) => setEditForm(prev => ({ ...prev, progress: e.target.value }))}
                          className="input-field"
                          placeholder="Current progress"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h2>
                    {resource.author && (
                      <p className="text-lg text-gray-600 mb-2">by {resource.author}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="capitalize">{resource.type}</span>
                      <span>•</span>
                      <span>Created {new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <span className="text-sm text-gray-600">{progressPercentage}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{resource.progress_minutes} minutes completed</span>
                <span>{resource.duration_minutes} minutes total</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Resource Type</h4>
                <p className="text-gray-600 capitalize">{resource.type}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Duration</h4>
                <p className="text-gray-600">{resource.duration_minutes} minutes</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Progress</h4>
                <p className="text-gray-600">{resource.progress_minutes} minutes</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                <p className="text-gray-600">{new Date(resource.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBackToMyLearning}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Learning
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Resource
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 