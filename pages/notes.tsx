import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Search, X, Star, Clock, Tag, MessageSquare, Sidebar, Edit3, BookOpen, Target } from 'lucide-react';
import { useUser } from '../modules/auth/hooks/useUser';
import { useToast } from '../modules/shared/context/ToastContext';
import { supabase } from '../modules/database/config/databaseConfig';
import RichTextEditor from '../modules/notes/components/RichTextEditor';
import AIChatPanel from '../modules/notes/components/AIChatPanel';

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

export default function AdvancedNotesPage() {
  const { user } = useUser();
  const { addToast } = useToast();
  const router = useRouter();
  
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingStartTime, setEditingStartTime] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [creatingNote, setCreatingNote] = useState(false);

  // Auto-save interval
  const saveNote = useCallback(async (note: Note) => {
    if (!user?.id || !note.id) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: note.title,
          content: note.content,
          tags: note.tags,
          last_edited_at: new Date().toISOString(),
        })
        .eq('id', note.id);

      if (error) throw error;

      // Update local state
      setNotes(prev => prev.map(n => 
        n.id === note.id ? { ...n, last_edited_at: new Date().toISOString() } : n
      ));

    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [user?.id]);

  // Auto-save when content changes
  const scheduleAutoSave = useCallback((note: Note) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      saveNote(note);
    }, 3000); // Save after 3 seconds of inactivity

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, saveNote]);

  // Load notes
  useEffect(() => {
    if (user?.id) {
      loadNotes();
    }
  }, [user?.id]);

  // Track editing time
  useEffect(() => {
    if (selectedNote && !editingStartTime) {
      setEditingStartTime(new Date());
    }

    return () => {
      if (editingStartTime && selectedNote) {
        const duration = Math.floor((new Date().getTime() - editingStartTime.getTime()) / 60000);
        if (duration > 0) {
          updateEditingDuration(selectedNote.id, duration);
        }
      }
    };
  }, [selectedNote, editingStartTime]);

  const updateEditingDuration = async (noteId: string, additionalMinutes: number) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          editing_duration_minutes: (selectedNote?.editing_duration_minutes || 0) + additionalMinutes
        })
        .eq('id', noteId);

      if (!error) {
        setNotes(prev => prev.map(n => 
          n.id === noteId ? { ...n, editing_duration_minutes: (n.editing_duration_minutes || 0) + additionalMinutes } : n
        ));
      }
    } catch (error) {
      console.error('Error updating editing duration:', error);
    }
  };

  const loadNotes = async () => {
    // Double-check authentication
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('Authentication error when loading notes:', authError);
      setLoading(false);
      return;
    }

    if (!user?.id) {
      console.error('No user found in context when loading notes');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Loading notes for user:', authUser.id);
      
      const { data, error } = await supabase
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
            name,
            emoji
          )
        `)
        .eq('user_id', authUser.id) // Use the freshly verified user ID
        .order('is_pinned', { ascending: false })
        .order('last_edited_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error.message, error.details);
        throw error;
      }

      console.log('Notes loaded successfully:', data?.length || 0, 'notes found');

      // Transform the joined data
      const transformedNotes = (data || []).map(note => {
        const resources = note.learning_resources as any;
        const habits = note.habits as any;
        return {
          ...note,
          resource_title: resources?.title,
          resource_emoji: resources?.emoji,
          habit_title: habits?.name,
          habit_emoji: habits?.emoji,
        };
      });

      setNotes(transformedNotes);
      
      // Auto-select first note if none selected
      if (!selectedNoteId && transformedNotes.length > 0) {
        setSelectedNoteId(transformedNotes[0].id);
        setSelectedNote(transformedNotes[0]);
      }
    } catch (error: any) {
      console.error('Error loading notes:', error);
      addToast(`Failed to load notes: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Select note
  const selectNote = useCallback((noteId: string) => {
    // Save editing time for previous note
    if (editingStartTime && selectedNote) {
      const duration = Math.floor((new Date().getTime() - editingStartTime.getTime()) / 60000);
      if (duration > 0) {
        updateEditingDuration(selectedNote.id, duration);
      }
    }

    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNoteId(noteId);
      setSelectedNote(note);
      setEditingStartTime(new Date());
      
      // On mobile, collapse sidebar when note is selected
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    }
  }, [notes, editingStartTime, selectedNote]);

  // Filter notes based on search
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Create new note and route to AI-powered editor
  const createNewNote = async () => {
    console.log('Create note button clicked');
    
    // Prevent duplicate note creation
    if (creatingNote) {
      console.log('Already creating note, preventing duplicate');
      return;
    }
    
    // Double-check authentication with Supabase Auth
    console.log('Checking authentication...');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('Authentication error:', authError);
      addToast('Please sign in again to create notes', 'error');
        return;
      }
    console.log('Authentication successful, user:', authUser);

    if (!user?.id) {
      console.error('No user found in context');
      addToast('Please sign in to create notes', 'error');
      return;
    }
    console.log('User context check passed');

    try {
      setCreatingNote(true);
      console.log('Creating new note for user:', authUser.id);
      
      const noteData = {
        user_id: authUser.id, // Use the freshly verified user ID
        title: '',
        content: '',
        is_pinned: false,
        editing_duration_minutes: 0,
        last_edited_at: new Date().toISOString(),
      };

      console.log('Note data to insert:', noteData);

      console.log('Inserting note into Supabase...');
      const { data, error } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error.message, error.details);
        throw error;
      }

      console.log('Note created successfully:', data);

      // Route to AI-powered editor interface
      const editUrl = `/notes/${data.id}/edit`;
      console.log('Routing to:', editUrl);
      router.push(editUrl);
      addToast('New note created! Starting AI-powered editor...', 'success');
    } catch (error: any) {
      console.error('Error creating note:', error);
      addToast(`Failed to create note: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      console.log('Resetting creatingNote state');
      setCreatingNote(false);
    }
  };

  // Toggle pin status
  const togglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !currentPinned })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, is_pinned: !currentPinned } : note
      ));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, is_pinned: !currentPinned } : null);
      }

      addToast(`Note ${!currentPinned ? 'pinned' : 'unpinned'}`, 'success');
    } catch (error) {
      console.error('Error toggling pin:', error);
      addToast('Failed to update note', 'error');
    }
  };

  // Update note content
  const updateNoteContent = (content: string) => {
    if (!selectedNote) return;
    
    const updatedNote = { ...selectedNote, content };
    setSelectedNote(updatedNote);
    scheduleAutoSave(updatedNote);
  };

  // Update note title
  const updateNoteTitle = (title: string) => {
    if (!selectedNote) return;
    
    const updatedNote = { ...selectedNote, title };
    setSelectedNote(updatedNote);
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title } : n));
    scheduleAutoSave(updatedNote);
  };

  // Add tag
  const addTag = () => {
    if (!tagInput.trim() || !selectedNote) return;
    
    const newTag = tagInput.trim().toLowerCase();
    const currentTags = selectedNote.tags || [];
    
    if (!currentTags.includes(newTag)) {
      const updatedTags = [...currentTags, newTag];
      const updatedNote = { ...selectedNote, tags: updatedTags };
      setSelectedNote(updatedNote);
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, tags: updatedTags } : n));
      scheduleAutoSave(updatedNote);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    if (!selectedNote) return;
    
    const updatedTags = (selectedNote.tags || []).filter(tag => tag !== tagToRemove);
    const updatedNote = { ...selectedNote, tags: updatedTags.length > 0 ? updatedTags : null };
    setSelectedNote(updatedNote);
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, tags: updatedTags.length > 0 ? updatedTags : null } : n));
    scheduleAutoSave(updatedNote);
  };

  // Insert AI content into note
  const insertAIContentToNote = (content: string) => {
    if (!selectedNote) return;
    
    const currentContent = typeof selectedNote.content === 'string' ? selectedNote.content : '';
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

  const getContentPreview = (content: any) => {
    if (!content) return 'No content';
    if (typeof content === 'string') return content.substring(0, 60) + '...';
    return 'Rich content...';
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Smart Notes - SmartShelf</title>
        </Head>
        <div className="h-screen flex bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Smart Notes - SmartShelf</title>
        <meta name="description" content="Advanced note-taking with AI assistance" />
      </Head>

      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Collapsible Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
          {!sidebarCollapsed && (
            <>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-gray-900">Smart Notes</h1>
                  <div className="flex items-center gap-2">
            <button
                      onClick={createNewNote}
                      disabled={creatingNote}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={creatingNote ? "Creating note..." : "New note"}
                    >
                      {creatingNote ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
            </button>
            <button 
                      onClick={() => setSidebarCollapsed(true)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Collapse sidebar"
            >
                      <X className="w-4 h-4" />
            </button>
          </div>
          </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notes and tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Edit3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No notes found</p>
                    <button
                      onClick={createNewNote}
                      disabled={creatingNote}
                      className="mt-2 text-sm text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="create-note-button-sidebar"
                    >
                      {creatingNote ? 'Creating...' : 'Create your first note'}
                    </button>
              </div>
            ) : (
                  <div className="p-2">
                    {filteredNotes.map((note) => (
                      <div
                      key={note.id}
                        onClick={() => selectNote(note.id)}
                        className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedNoteId === note.id
                            ? 'bg-blue-50 border-blue-200 border'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {note.is_pinned && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                              <h3 className="font-medium text-gray-900 text-sm truncate">
                                {note.title || 'Untitled'}
                              </h3>
                        </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {getContentPreview(note.content)}
                            </p>
                            
                            {/* Tags */}
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {note.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    #{tag}
                                  </span>
                                ))}
                                {note.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{note.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Linked Resource/Habit */}
                            {(note.resource_title || note.habit_title) && (
                              <div className="flex items-center gap-1 mb-2">
                                {note.resource_title && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {note.resource_emoji} {note.resource_title.substring(0, 12)}...
                                  </span>
                                )}
                                {note.habit_title && (
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {note.habit_emoji} {note.habit_title.substring(0, 12)}...
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(note.last_edited_at)}
                              </span>
                              <div className="flex items-center gap-2">
                                {note.editing_duration_minutes > 0 && (
                                  <span>{note.editing_duration_minutes}m</span>
                                )}
                              <button
                          onClick={(e) => {
                            e.stopPropagation();
                                    togglePin(note.id, note.is_pinned);
                          }}
                                  className="hover:text-yellow-500 transition-colors"
                        >
                                  <Star className={`w-3 h-3 ${note.is_pinned ? 'text-yellow-500 fill-current' : ''}`} />
                              </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
                        )}
                            </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Show sidebar"
                >
                  <Sidebar className="w-4 h-4" />
                </button>
              )}
              {selectedNote && (
                  <input
                    type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNoteTitle(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Note title..."
                />
              )}
              {selectedNote?.is_pinned && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            
            {selectedNote && (
              <div className="flex items-center gap-4">
                {/* Tags */}
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-1">
                    {selectedNote.tags?.map((tag) => (
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
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Chat</span>
                </div>
              </div>
            )}
        </div>

          {/* Content Area */}
          {selectedNote ? (
            <div className="flex-1 flex">
              {/* Note Editor (50%) */}
              <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
                <div className="h-full p-6">
                  <RichTextEditor
                    content={typeof selectedNote.content === 'string' ? selectedNote.content : ''}
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
                  noteId={selectedNote.id}
                  noteTitle={selectedNote.title}
                  noteContent={typeof selectedNote.content === 'string' ? selectedNote.content : ''}
                  onInsertToNote={insertAIContentToNote}
                  linkedResourceId={selectedNote.linked_resource_id}
                  linkedHabitId={selectedNote.linked_habit_id}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <Edit3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Smart Notes</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Create and organize your thoughts with AI-powered assistance. 
                  Your notes are automatically saved and synced.
                </p>
                  <button
                  onClick={createNewNote}
                  disabled={creatingNote}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="create-note-button-main"
                >
                  {creatingNote ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating note...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create your first note
                    </>
                  )}
                  </button>
              </div>
            </div>
          )}
          </div>

        {/* Floating Action Button for Mobile */}
        <button
          onClick={createNewNote}
          disabled={creatingNote}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center md:hidden disabled:opacity-50 disabled:cursor-not-allowed"
          title={creatingNote ? "Creating note..." : "Create new note"}
          data-testid="create-note-fab"
        >
          {creatingNote ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
} 