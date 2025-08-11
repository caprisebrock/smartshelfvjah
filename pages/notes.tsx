import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../lib/useUser';
import { Note, getNotes, createNote, getNoteById, updateNoteFast, deleteNoteById, quickCreateNote, flushNoteUpdates } from '../lib/notes';
import { useChat } from '../lib/ChatContext';
import { getOrCreateNoteSession } from '../lib/chatNoteBridge';
import { Search, Plus, Save, Check, Trash2 } from 'lucide-react';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';

// Lightweight type for note summaries
type NoteSummary = { 
  id: string; 
  title: string; 
  content: any; 
  updated_at: string | null; 
};

type Draft = { title: string; content: any };

export default function NotesPage() {
  const { user } = useUser();
  const router = useRouter();
  const { state, sendMessage, setCurrentSessionId } = useChat();
  
  // Core state
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);
  
  // Local editing state
  const [localTitle, setLocalTitle] = useState<string>('');
  const [localContent, setLocalContent] = useState<string>('');
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);
  
  // Chat panel state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<Array<{
    id: string;
    session_id: string;
    sender: 'user' | 'assistant';
    content: string;
    created_at: string;
    pending?: boolean;
    error?: boolean;
  }>>([]);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simple debounce utility
  const debounce = <T extends (...args: any[]) => void>(fn: T, ms = 700) => {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Debounced search
  const debouncedSearch = useMemo(() => debounce((query: string) => {
    setSearchQuery(query);
  }, 200), []);

  // Debounced save function
  const saveSelected = useMemo(() => debounce(async (id: string, draft: Draft) => {
    try {
      setSaving(true);
      await updateNoteFast(id, { title: draft.title, content: draft.content });
    } finally {
      setSaving(false);
    }
  }, 700), []);

  // Load notes
  useEffect(() => {
    if (!user?.id) return;
    getNotes(user.id).then(setNotes).catch(console.error);
  }, [user?.id]);

  // One-time session hookup per note (prevents double renders)
  useEffect(() => {
    let cancelled = false;
    
    async function run() {
      if (!selectedNoteId) { 
        setSessionId(null); 
        return; 
      }
      
      try {
        // IMPORTANT: do not call sendMessage here; only ensure we have a session
        const session = await getOrCreateNoteSession(selectedNoteId);
        if (!cancelled) {
          setSessionId(session.id);
          // Set as current session in ChatContext
          await setCurrentSessionId(session.id);
        }
      } catch (error) {
        console.error('Error setting up note session:', error);
        if (!cancelled) setSessionId(null);
      }
    }
    
    run();
    return () => { cancelled = true; };
  }, [selectedNoteId, setCurrentSessionId]);

  // Note selection logic
  const selectNote = useCallback(async (id: string) => {
    // Flush any pending updates for the previous note
    if (selectedNoteId) {
      // Use existing flushNoteUpdates if available, otherwise clear timeout manually
      if (typeof flushNoteUpdates === 'function') {
        flushNoteUpdates(selectedNoteId);
      }
    }
    
    setSelectedNoteId(id);
    if (!drafts[id]) {
      const n = notes.find(n => n.id === id) ?? await getNoteById(id);
      setDrafts(prev => ({ 
        ...prev, 
        [id]: { 
          title: n.title ?? 'Untitled', 
          content: n.content ?? {} 
        } 
      }));
    }
    
    // Set local state once when switching notes
    const draft = drafts[id];
    if (draft) {
      setLocalTitle(draft.title || 'Untitled');
      setLocalContent(draft.content?.text || '');
    } else {
      const n = notes.find(n => n.id === id);
      setLocalTitle(n?.title || 'Untitled');
      setLocalContent(n?.content?.text || '');
    }
    setIsTitleEditing(false);
    
    // Clear optimistic messages when switching notes
    setOptimisticMessages([]);
  }, [notes, drafts, selectedNoteId]);

  // Title change handlers
  const handleTitleChange = useCallback((val: string) => {
    setLocalTitle(val);
    // Don't save immediately - wait for blur or Enter
  }, []);

  const handleTitleBlur = useCallback(() => {
    if (!selectedNoteId) return;
    
    const trimmedTitle = localTitle.trim();
    const finalTitle = trimmedTitle || 'Untitled';
    
    // Update drafts and save
    setDrafts(prev => ({
      ...prev,
      [selectedNoteId]: {
        ...prev[selectedNoteId],
        title: finalTitle
      }
    }));
    
    // Save to Supabase - get current content from drafts
    const currentContent = drafts[selectedNoteId]?.content || {};
    saveSelected(selectedNoteId, { title: finalTitle, content: currentContent });
    setIsTitleEditing(false);
  }, [selectedNoteId, localTitle, saveSelected, drafts]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    }
  }, [handleTitleBlur]);

  // Content change handlers
  const handleContentChange = useCallback((nextContent: any) => {
    if (!selectedNoteId) return;
    
    setLocalContent(nextContent.text || '');
    
    setDrafts(prev => {
      const next = { 
        ...(prev[selectedNoteId] ?? { title: 'Untitled', content: {} }), 
        content: nextContent 
      };
      const all = { ...prev, [selectedNoteId]: next };
      saveSelected(selectedNoteId, next);
      return all;
    });
  }, [selectedNoteId, saveSelected]);

  // Optimistic send message handler
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !sessionId) return;
    
    // Clear input immediately
    setInputValue('');
    
    // Create optimistic message
    const tempId = `temp-${Date.now()}-user`;
    const optimisticMessage = {
      id: tempId,
      session_id: sessionId,
      sender: 'user' as const,
      content: text,
      created_at: new Date().toISOString(),
      pending: true
    };
    
    // Add to optimistic messages
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    
    // Scroll to bottom
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    
    try {
      // Send message via ChatContext
      await sendMessage(text);
      
      // Remove optimistic message on success
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark optimistic message as error
      setOptimisticMessages(prev => 
        prev.map(m => m.id === tempId ? { ...m, error: true } : m)
      );
    }
  };

  // Get messages for current session (memoized to avoid re-renders)
  const currentMessages = useMemo(() => {
    if (!sessionId) return [];
    
    // Get messages from ChatContext for this session
    const contextMessages = state.messages.filter(m => m.session_id === sessionId);
    
    // Combine with optimistic messages
    const optimisticForSession = optimisticMessages.filter(m => m.session_id === sessionId);
    
    return [...contextMessages, ...optimisticForSession];
  }, [sessionId, state.messages, optimisticMessages]);

  const handleNewNote = async () => {
    if (!user?.id) return;
    try {
      const newNote = await quickCreateNote(user.id);
      setNotes(prev => [newNote, ...prev]);
      await selectNote(newNote.id);
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteById(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
      setDrafts(prev => {
        const { [noteId]: deleted, ...rest } = prev;
        return rest;
      });
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Open Chat for selected note - routes to existing AI Chat
  const openChatForSelected = () => {
    if (!selectedNoteId) return;
    router.push(`/aichat?noteId=${selectedNoteId}`);
  };

  // Filter notes based on search
  const filteredNotes = notes.filter(note => {
    const title = (note.title || 'Untitled').toLowerCase();
    const content = JSON.stringify(note.content).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return title.includes(query) || content.includes(query);
  });

  // Get current draft
  const currentDraft = selectedNoteId ? drafts[selectedNoteId] : null;

  return (
    <div className="notes-page">
      <Head>
        <title>Notes - SmartShelf</title>
      </Head>

      <header className="notes-page__header">
        <div className="notes-header">
          <button
            onClick={() => router.back()}
            className="back-link"
          >
            Back to Dashboard
          </button>
          <h1>Notes</h1>
          <div className="spacer" />
          <div className="right-controls">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 w-64"
              />
            </div>
            
            {/* New Note Button */}
            <button
              onClick={handleNewNote}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>
      </header>

      <div className={`notes-main ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <aside className="notes-list-pane">
          <div className="notes-list-header">
            <span>Notes</span>
            <button
              type="button"
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(true)}
              aria-label="Collapse notes sidebar"
            >
              ⟨
            </button>
          </div>
          
          {/* Notes List */}
          <div className="p-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-lg font-medium mb-2">No notes yet</div>
                <div className="text-sm">Create your first note to get started</div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map(note => {
                  const draft = drafts[note.id];
                  const previewTitle = draft?.title ?? note.title;
                  const previewContent = draft?.content?.text ?? note.content?.text;
                  
                  return (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note.id)}
                      className={`group relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                        selectedNoteId === note.id
                          ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-medium truncate">{previewTitle || 'Untitled'}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                        {previewContent ? previewContent.substring(0, 50) + '...' : 'No content'}
                      </div>
                      
                      {/* Delete button - hover to reveal */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(note.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="notes-editor-pane">
          {selectedNoteId && currentDraft ? (
            <div className="h-full flex flex-col">
              <div className="p-6">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full text-2xl font-medium bg-transparent border-none outline-none mb-6"
                  placeholder="Untitled"
                  onFocus={() => setIsTitleEditing(true)}
                />
                <textarea
                  value={localContent}
                  onChange={(e) => handleContentChange({ type: 'plain', text: e.target.value })}
                  className="w-full flex-1 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 resize-none"
                  placeholder="Start writing your note..."
                  style={{ minHeight: '400px' }}
                />
                {saving && <div className="text-sm text-zinc-500 mt-3">Saving...</div>}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-lg font-medium mb-2">Select a note to start</div>
                <div className="text-sm">Choose a note from the left or create a new one</div>
              </div>
            </div>
          )}
        </main>

        <section className="notes-chat-pane">
          {selectedNoteId && currentDraft ? (
            <>
              <div className="chat-header">
                <div className="text-sm text-zinc-600 dark:text-zinc-300">
                  Chat for: <span className="font-medium">{currentDraft.title || 'Untitled'}</span>
                </div>
              </div>
              
              <div className="chat-scroll">
                <MessageList 
                  messages={currentMessages} 
                  typing={typing && state.sending}
                  bottomRef={bottomRef}
                />
              </div>
              
              <div className="chat-dock">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSendMessage}
                  sending={state.sending}
                  disabled={!sessionId || !inputValue.trim()}
                  onLinkChat={() => {}}
                  onAttach={(files) => console.log('Attached files:', files.map(f => f.name))}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium mb-2">Select a note to chat</div>
                <div className="text-sm">Choose a note to start a conversation</div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Floating expand button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button
          type="button"
          className="expand-btn"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand notes sidebar"
          title="Show notes list"
        >
          ☰
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Note</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 