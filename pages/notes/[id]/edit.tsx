import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Star, Clock, Tag, X, BookOpen, Target, Sidebar } from 'lucide-react';
import { useUser } from '../../../modules/auth/hooks/useUser';
import { useToast } from '../../../modules/shared/context/ToastContext';
import { supabase } from '../../../modules/database/config/databaseConfig';
import RichTextEditor from '../../../modules/notes/components/RichTextEditor';
import AIChatPanel from '../../../modules/notes/components/AIChatPanel';

interface Note {
  id: string;
  title: string;
  content: any;
  is_pinned: boolean;
  tags: string[] | null;
  editing_duration_minutes: number;
  linked_resource_id: string | null;
  linked_habit_id: string | null;
  created_at: string;
  updated_at: string;
  last_edited_at: string;
  // Joined data
  resource_title?: string;
  resource_emoji?: string;
  habit_title?: string;
  habit_emoji?: string;
}

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

export default function AINotesEditor() {
  const { user } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  const { id } = router.query;
  
  // State
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [editingStartTime, setEditingStartTime] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState('');
  
  // Linking options
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showLinkingPanel, setShowLinkingPanel] = useState(false);

  // Auto-save function
  const saveNote = useCallback(async (noteData: Partial<Note>) => {
    if (!user?.id || !note?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('notes')
        .update({
          title: noteData.title || note.title,
          content: noteData.content || note.content,
          tags: noteData.tags !== undefined ? noteData.tags : note.tags,
          is_pinned: noteData.is_pinned !== undefined ? noteData.is_pinned : note.is_pinned,
          linked_resource_id: noteData.linked_resource_id !== undefined ? noteData.linked_resource_id : note.linked_resource_id,
          linked_habit_id: noteData.linked_habit_id !== undefined ? noteData.linked_habit_id : note.linked_habit_id,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', note.id);

      if (error) throw error;

      // Update local state
      setNote(prev => prev ? { ...prev, ...noteData, last_edited_at: new Date().toISOString() } : null);
      
    } catch (error) {
      console.error('Error saving note:', error);
      addToast('Failed to auto-save', 'error');
    } finally {
      setSaving(false);
    }
  }, [user?.id, note?.id, addToast]);

  // Schedule auto-save
  const scheduleAutoSave = useCallback((noteData: Partial<Note>) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      saveNote(noteData);
    }, 3000); // Save after 3 seconds of inactivity

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, saveNote]);

  // Load note data
  useEffect(() => {
    console.log('Edit page - id param:', id);
    console.log('Edit page - user:', user);
    
    if (id && user?.id && typeof id === 'string') {
      console.log('Loading note with id:', id);
      loadNote(id);
      loadLinkingOptions();
    } else {
      console.log('Missing required data - id or user:', { id, userId: user?.id });
    }
  }, [id, user?.id]);

  // Track editing time
  useEffect(() => {
    if (note && !editingStartTime) {
      setEditingStartTime(new Date());
    }

    return () => {
      if (editingStartTime && note) {
        const duration = Math.floor((new Date().getTime() - editingStartTime.getTime()) / 60000);
        if (duration > 0) {
          updateEditingDuration(duration);
        }
      }
    };
  }, [note, editingStartTime]);

  const loadNote = async (noteId: string) => {
    try {
      setLoading(true);
      console.log('Loading note with ID:', noteId);
      console.log('User ID for query:', user!.id);

      const query = supabase
        .from('notes')
        .select(`
          id,
          title,
          content,
          is_pinned,
          tags,
          editing_duration_minutes,
          linked_resource_id,
          linked_habit_id,
          created_at,
          updated_at,
          last_edited_at,
          learning_resources:linked_resource_id (
            title,
            emoji
          ),
          habits:linked_habit_id (
            title,
            emoji
          )
        `)
        .eq('id', noteId)
        .eq('user_id', user!.id)
        .single();
      
      console.log('Supabase query:', query);
      const { data, error } = await query;
      console.log('Query result - data:', data, 'error:', error);

      if (error) {
        if (error.code === 'PGRST116') {
          console.error('Note not found error:', error);
          addToast('Note not found', 'error');
          router.push('/notes');
        } else {
          console.error('Other Supabase error:', error);
          throw error;
        }
        return;
      }

      console.log('Note data loaded successfully:', data);
      // Transform the joined data
      const resources = data.learning_resources as any;
      const habits = data.habits as any;
      const transformedNote = {
        ...data,
        resource_title: resources?.title,
        resource_emoji: resources?.emoji,
        habit_title: habits?.title,
        habit_emoji: habits?.emoji,
      };

      console.log('Transformed note:', transformedNote);
      setNote(transformedNote);
    } catch (error) {
      console.error('Error loading note:', error);
      addToast('Failed to load note', 'error');
      router.push('/notes');
    } finally {
      setLoading(false);
    }
  };

  const loadLinkingOptions = async () => {
    if (!user?.id) return;
    
    try {
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
      console.error('Error loading linking options:', error);
    }
  };

  const updateEditingDuration = async (additionalMinutes: number) => {
    if (!note) return;
    
    try {
      const newDuration = (note.editing_duration_minutes || 0) + additionalMinutes;
      
      const { error } = await supabase
        .from('notes')
        .update({ editing_duration_minutes: newDuration })
        .eq('id', note.id);

      if (!error) {
        setNote(prev => prev ? { ...prev, editing_duration_minutes: newDuration } : null);
      }
    } catch (error) {
      console.error('Error updating editing duration:', error);
    }
  };

  // Update handlers
  const updateNoteTitle = (title: string) => {
    if (!note) return;
    
    const updatedNote = { title };
    setNote(prev => prev ? { ...prev, title } : null);
    scheduleAutoSave(updatedNote);
  };

  const updateNoteContent = (content: string) => {
    if (!note) return;
    
    const updatedNote = { content };
    setNote(prev => prev ? { ...prev, content } : null);
    scheduleAutoSave(updatedNote);
  };

  const togglePin = async () => {
    if (!note) return;
    
    const newPinned = !note.is_pinned;
    const updatedNote = { is_pinned: newPinned };
    setNote(prev => prev ? { ...prev, is_pinned: newPinned } : null);
    scheduleAutoSave(updatedNote);
    addToast(`Note ${newPinned ? 'pinned' : 'unpinned'}`, 'success');
  };

  const addTag = () => {
    if (!tagInput.trim() || !note) return;
    
    const newTag = tagInput.trim().toLowerCase();
    const currentTags = note.tags || [];
    
    if (!currentTags.includes(newTag)) {
      const updatedTags = [...currentTags, newTag];
      const updatedNote = { tags: updatedTags };
      setNote(prev => prev ? { ...prev, tags: updatedTags } : null);
      scheduleAutoSave(updatedNote);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (!note) return;
    
    const updatedTags = (note.tags || []).filter(tag => tag !== tagToRemove);
    const updatedNote = { tags: updatedTags.length > 0 ? updatedTags : null };
    setNote(prev => prev ? { ...prev, tags: updatedTags.length > 0 ? updatedTags : null } : null);
    scheduleAutoSave(updatedNote);
  };

  const updateLinkedResource = (resourceId: string) => {
    if (!note) return;
    
    const updatedNote = { 
      linked_resource_id: resourceId || null,
      linked_habit_id: resourceId ? null : note.linked_habit_id // Clear habit if resource selected
    };
    setNote(prev => prev ? { ...prev, ...updatedNote } : null);
    scheduleAutoSave(updatedNote);
  };

  const updateLinkedHabit = (habitId: string) => {
    if (!note) return;
    
    const updatedNote = { 
      linked_habit_id: habitId || null,
      linked_resource_id: habitId ? null : note.linked_resource_id // Clear resource if habit selected
    };
    setNote(prev => prev ? { ...prev, ...updatedNote } : null);
    scheduleAutoSave(updatedNote);
  };

  const insertAIContentToNote = (content: string) => {
    if (!note) return;
    
    const currentContent = typeof note.content === 'string' ? note.content : '';
    const newContent = currentContent + '\n\n' + content;
    updateNoteContent(newContent);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Note - SmartShelf</title>
        </Head>
        <div className="h-screen flex bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  if (!note) {
    return (
      <>
        <Head>
          <title>Note Not Found - SmartShelf</title>
        </Head>
        <div className="h-screen flex bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Note not found</h2>
              <button
                onClick={() => router.push('/notes')}
                className="text-blue-600 hover:underline"
              >
                ← Back to Notes
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{note.title || 'Untitled Note'} - SmartShelf</title>
        <meta name="description" content="AI-powered note editing" />
      </Head>
      
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/notes')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to notes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={note.title}
              onChange={(e) => updateNoteTitle(e.target.value)}
              placeholder="Untitled Note"
              className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 min-w-0 flex-1"
            />
            {note.is_pinned && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Auto-save status */}
            <div className="text-sm text-gray-500">
              {saving ? 'Saving...' : 'Saved'}
            </div>
            
            {/* Tags */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-1">
                {note.tags?.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  >
                    #{tag} ✕
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[80px]"
                />
              </div>
            </div>

            {/* Pin button */}
            <button
              onClick={togglePin}
              className="p-2 text-gray-600 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
              title={note.is_pinned ? 'Unpin note' : 'Pin note'}
            >
              <Star className={`w-4 h-4 ${note.is_pinned ? 'text-yellow-500 fill-current' : ''}`} />
            </button>

            {/* Linking panel toggle */}
            <button
              onClick={() => setShowLinkingPanel(!showLinkingPanel)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Link to resource or habit"
            >
              <Sidebar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Note Editor (50%) */}
          <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
            <div className="h-full p-6">
              <RichTextEditor
                content={typeof note.content === 'string' ? note.content : ''}
                onChange={updateNoteContent}
                placeholder="Start writing your note..."
                onUpdate={() => {
                  // Optional: additional actions on content update
                }}
              />
            </div>
          </div>

          {/* AI Chat Panel (50%) */}
          <div className="flex-1 bg-gray-50">
            <AIChatPanel
              noteId={note.id}
              noteTitle={note.title}
              noteContent={typeof note.content === 'string' ? note.content : ''}
              onInsertToNote={insertAIContentToNote}
              linkedResourceId={note.linked_resource_id}
              linkedHabitId={note.linked_habit_id}
            />
          </div>
        </div>

        {/* Linking Panel (Collapsible Right Sidebar) */}
        {showLinkingPanel && (
          <div className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l border-gray-200 z-40 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Link Note</h3>
                <button
                  onClick={() => setShowLinkingPanel(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Link to Learning Resource */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Learning Resource
                </label>
                <select
                  value={note.linked_resource_id || ''}
                  onChange={(e) => updateLinkedResource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Habit
                </label>
                <select
                  value={note.linked_habit_id || ''}
                  onChange={(e) => updateLinkedHabit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None</option>
                  {habits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.emoji} {habit.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {formatDate(note.created_at)}</span>
                </div>
                {note.editing_duration_minutes > 0 && (
                  <div>Edited for {note.editing_duration_minutes} minutes</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}