import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, BookOpen, Target, Tag, X } from 'lucide-react';
import { useUser } from '../../modules/auth/hooks/useUser';
import { useToast } from '../../modules/shared/context/ToastContext';
import { supabase } from '../../modules/database/config/databaseConfig';

interface LearningResource {
  id: string;
  title: string;
  emoji: string;
}

interface Habit {
  id: string;
  title: string;
  emoji: string;
}

export default function NewNotePage() {
  const { user } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  
  // Get pre-selected resource or habit from query params
  const { resource_id, habit_id } = router.query;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkedResourceId, setLinkedResourceId] = useState<string>('');
  const [linkedHabitId, setLinkedHabitId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Data for dropdowns
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadLinkOptions();
    }
  }, [user?.id]);

  useEffect(() => {
    // Pre-select resource or habit if provided in query params
    if (resource_id && typeof resource_id === 'string') {
      setLinkedResourceId(resource_id);
    }
    if (habit_id && typeof habit_id === 'string') {
      setLinkedHabitId(habit_id);
    }
  }, [resource_id, habit_id]);

  const loadLinkOptions = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingData(true);
      
      // Load learning resources
      const { data: resources, error: resourcesError } = await supabase
        .from('learning_resources')
        .select('id, title, emoji')
        .eq('user_id', user.id)
        .order('title');
      
      if (resourcesError) throw resourcesError;
      
      // Load habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, title, emoji')
        .eq('user_id', user.id)
        .order('title');
      
      if (habitsError) throw habitsError;
      
      setLearningResources(resources || []);
      setHabits(habitsData || []);
    } catch (error) {
      console.error('Error loading link options:', error);
      addToast('Failed to load linking options', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const saveNote = async () => {
    if (!user?.id) {
      addToast('Please sign in to save notes', 'error');
      return;
    }

    if (!title.trim()) {
      addToast('Please enter a title for your note', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const noteData = {
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        linked_resource_id: linkedResourceId || null,
        linked_habit_id: linkedHabitId || null,
        tags: tags.length > 0 ? tags : null,
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;

      addToast('Note created successfully!', 'success');
      router.push(`/notes/${data.id}`);
    } catch (error) {
      console.error('Error saving note:', error);
      addToast('Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Note - SmartShelf</title>
        <meta name="description" content="Create a new learning note" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <main className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">New Note</h1>
            </div>
            <button
              onClick={saveNote}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Linking Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Link to Learning Resource */}
              <div>
                <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Link to Learning Resource
                </label>
                <select
                  id="resource"
                  value={linkedResourceId}
                  onChange={(e) => {
                    setLinkedResourceId(e.target.value);
                    if (e.target.value) setLinkedHabitId(''); // Clear habit if resource selected
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingData}
                >
                  <option value="">None</option>
                  {learningResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.emoji} {resource.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link to Habit */}
              <div>
                <label htmlFor="habit" className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Link to Habit
                </label>
                <select
                  id="habit"
                  value={linkedHabitId}
                  onChange={(e) => {
                    setLinkedHabitId(e.target.value);
                    if (e.target.value) setLinkedResourceId(''); // Clear resource if habit selected
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingData}
                >
                  <option value="">None</option>
                  {habits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.emoji} {habit.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag and press Enter..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                disabled={saving || !title.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
