import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../lib/useUser';
import { Note, getNotes, createNote, getNoteById, updateNoteFast, deleteNoteById, quickCreateNote, flushNoteUpdates } from '../lib/notes';
import { useChat } from '../lib/ChatContext';
import { useToast } from '../lib/ToastContext';
import { supabase } from '../lib/supabaseClient';
import { getOrCreateNoteSession } from '../lib/chatNoteBridge';
import { Search, Plus, Save, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { clsx } from 'clsx';
import styles from '../styles/notes.module.css';

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
  const { state, sendMessage, setCurrentSessionId, createNewSession } = useChat();
  const { addToast } = useToast();
  
  // Core state
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { title: string; content: any }>>({});
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      
      // Flush any pending saves for the previous note
      if (selectedNoteId) {
        // TODO: Implement flushNoteUpdates if needed
      }
      
      try {
        // Try to get existing session first
        let session = await getOrCreateNoteSession(selectedNoteId);
        
        // If no session exists, create one using ChatContext
        if (!session) {
          await createNewSession('note', undefined, undefined, selectedNoteId);
          // Get the session ID from localStorage after creation
          const newSessionId = localStorage.getItem('currentSessionId');
          if (newSessionId) {
            session = { id: newSessionId, title: 'Note Chat' };
          }
        }
        
        if (!cancelled && session) {
          setSessionId(session.id);
          // Set current session in ChatContext
          await setCurrentSessionId(session.id);
        }
      } catch (error) {
        console.error('Failed to get/create note session:', error);
      }
    }
    
    run();
    
    return () => {
      cancelled = true;
    };
  }, [selectedNoteId, setCurrentSessionId, createNewSession]);

  // Handle linking session to resource
  const handleLinkSession = async (linkType: 'learning' | 'habit', linkId: string, linkTitle: string) => {
    if (!sessionId) return;
    
    try {
      // Update the session with link information
      const { error } = await supabase
        .from('sessions')
        .update({
          link_type: linkType === 'learning' ? 'learning_resource' : 'habit',
          link_id: linkId,
          link_title: linkTitle,
          ...(linkType === 'learning' ? { linked_learning_resource: linkId } : {}),
          ...(linkType === 'habit' ? { linked_habit: linkId } : {})
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      addToast(`Linked to ${linkType}: ${linkTitle}`, 'success');
      
      // Enqueue AI context breadcrumb for linked resource
      enqueue(async () => {
        try {
          // Fetch minimal metadata for the resource
          let resource: any;
          if (linkType === 'learning') {
            const { data } = await supabase
              .from('learning_resources')
              .select('id, title, type, author, total_minutes, minutes_completed')
              .eq('id', linkId)
              .single();
            resource = data;
          } else if (linkType === 'habit') {
            const { data } = await supabase
              .from('habits')
              .select('id, title, description, frequency')
              .eq('id', linkId)
              .single();
            resource = data;
          }

          if (resource) {
            // Create a system message for AI context
            const resourceType = linkType === 'learning' ? (resource.type || 'learning resource') : 'habit';
            const systemMessage = {
              id: `system-${Date.now()}`,
              session_id: sessionId,
              sender: 'assistant' as const,
              content: `Linked resource: "${resource.title}" (${resourceType}). If the user asks, summarize or reference it.`,
              created_at: new Date().toISOString(),
              token_count: 0
            };

            // Insert the system message into Supabase
            await supabase
              .from('session_messages')
              .insert({
                session_id: sessionId,
                sender: 'assistant',
                content: systemMessage.content,
                token_count: 0
              });

            // Add to local state for immediate display
            setOptimisticMessages(prev => [...prev, systemMessage]);
          }
        } catch (error) {
          console.error('Failed to create AI context breadcrumb:', error);
        }
      });
      
      // Refresh the session to get updated link information
      await setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Failed to link session to resource:', error);
      addToast('Failed to link resource', 'error');
    }
  };

  // Simple enqueue function for async side effects
  const enqueue = (task: () => Promise<void>) => {
    // Execute immediately for now, could be enhanced with a proper queue
    task();
  };

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    return notes.filter(note => {
      const title = (note.title || 'Untitled').toLowerCase();
      const content = JSON.stringify(note.content).toLowerCase();
      const query = searchQuery.toLowerCase();
      
      return title.includes(query) || content.includes(query);
    });
  }, [notes, searchQuery]);

  // Get current draft
  const currentDraft = selectedNoteId ? drafts[selectedNoteId] : null;

  // Get current messages for the selected note
  const currentMessages = useMemo(() => {
    if (!sessionId) return [];
    
    // Combine real messages from ChatContext with optimistic messages
    const realMessages = state.messages.filter(msg => msg.session_id === sessionId);
    return [...realMessages, ...optimisticMessages.filter(msg => msg.session_id === sessionId)];
  }, [state.messages, optimisticMessages, sessionId]);

  // Get current session for linking display
  const currentSession = useMemo(() => {
    return state.sessions.find(s => s.id === sessionId) || state.currentSession;
  }, [state.sessions, state.currentSession, sessionId]);

  // Handle note selection
  const selectNote = async (noteId: string) => {
    setSelectedNoteId(noteId);
    
    // Get or create draft for this note
    if (!drafts[noteId]) {
      const note = notes.find(n => n.id === noteId) || await getNoteById(noteId);
      setDrafts(prev => ({
        ...prev,
        [noteId]: {
          title: note.title || 'Untitled',
          content: note.content || { type: 'plain', text: '' }
        }
      }));
    }
    
    // Set local editing state
    const draft = drafts[noteId] || { title: 'Untitled', content: { type: 'plain', text: '' } };
    setLocalTitle(draft.title);
    setLocalContent(draft.content.text || '');
    setIsTitleEditing(false);
  };

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
    if (selectedNoteId) {
      setDrafts(prev => ({
        ...prev,
        [selectedNoteId]: {
          ...prev[selectedNoteId],
          title: newTitle
        }
      }));
      saveSelected(selectedNoteId, {
        title: newTitle,
        content: drafts[selectedNoteId]?.content || {}
      });
    }
  };

  // Handle title blur (save on blur)
  const handleTitleBlur = () => {
    setIsTitleEditing(false);
    if (selectedNoteId && localTitle.trim() !== drafts[selectedNoteId]?.title) {
      const finalTitle = localTitle.trim() || 'Untitled';
      setLocalTitle(finalTitle);
      setDrafts(prev => ({
        ...prev,
        [selectedNoteId]: {
          ...prev[selectedNoteId],
          title: finalTitle
        }
      }));
      saveSelected(selectedNoteId, {
        title: finalTitle,
        content: drafts[selectedNoteId]?.content || {}
      });
    }
  };

  // Handle title key press (save on Enter)
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  // Handle content changes
  const handleContentChange = (newContent: any) => {
    setLocalContent(newContent.text || '');
    if (selectedNoteId) {
      setDrafts(prev => ({
        ...prev,
        [selectedNoteId]: {
          ...prev[selectedNoteId],
          content: newContent
        }
      }));
      saveSelected(selectedNoteId, {
        title: drafts[selectedNoteId]?.title || 'Untitled',
        content: newContent
      });
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;
    
    const messageContent = inputValue.trim();
    setInputValue('');
    
    // Add optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      sender: 'user' as const,
      content: messageContent,
      created_at: new Date().toISOString(),
      pending: true
    };
    
    setOptimisticMessages(prev => [...prev, tempMessage]);
    
    try {
      // Send message via ChatContext
      await sendMessage(messageContent);
      
      // Remove optimistic message on success
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      // Scroll to bottom
      if (bottomRef.current) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark optimistic message as error
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, error: true, pending: false } : msg
        )
      );
    }
  };

  // Handle creating new note
  const handleNewNote = async () => {
    if (!user?.id) return;
    
    try {
      const newNote = await quickCreateNote(user.id);
      setNotes(prev => [newNote, ...prev]);
      await selectNote(newNote.id);
    } catch (error) {
      console.error('Failed to create note:', error);
      addToast('Failed to create note', 'error');
    }
  };

  // Handle deleting note
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteById(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      
      // Clean up drafts
      setDrafts(prev => {
        const { [noteId]: _, ...rest } = prev;
        return rest;
      });
      
      // Clear selection if this was the selected note
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
        setLocalTitle('');
        setLocalContent('');
      }
      
      addToast('Note deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete note:', error);
      addToast('Failed to delete note', 'error');
    }
  };

  return (
    <>
      <Head>
        <title>Notes - SmartShelf</title>
      </Head>

      <div className="notes-page">
        <header className={styles.header}>
          <button
            className={styles.collapseBtn}
            aria-label={sidebarOpen ? 'Collapse notes list' : 'Expand notes list'}
            onClick={() => setSidebarOpen(v => !v)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className={styles.headerTitle}>
            <a href="/" className={styles.back}>Back to Dashboard</a>
            <span className={styles.sep}>•</span>
            <span className={styles.notes}>Notes</span>
          </div>
          <div className={styles.headerRight}>
            <input 
              className="rounded-md px-3 py-2 text-sm text-black w-[280px]" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <button 
              className="rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 transition-colors" 
              onClick={handleNewNote}
            >
              + New Note
            </button>
          </div>
        </header>

        <div 
          className={clsx(styles.notesGrid, sidebarOpen ? styles.open : styles.closed)}
        >
          <aside className={clsx(
            styles.notesList,
            "transition-all duration-200 ease-out",
            sidebarOpen ? "w-[280px] opacity-100" : "w-0 opacity-0 pointer-events-none"
          )}>
            
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

          <main className={styles.notesEditor}>
            {selectedNoteId && currentDraft ? (
              <div className="h-full flex flex-col">
                <div className="h-full">
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

          {/* RIGHT: chat pane */}
          <section className={styles.notesChat}>
            {/* Chat header */}
            <div className={styles.chatHeader}>
              <div className="text-sm text-neutral-600">
                Chat for: {currentDraft?.title ?? 'Untitled'}
                {currentSession?.link_title && (
                  <span className="ml-2 text-xs text-neutral-500">
                    Linked: {currentSession.link_title}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
              <MessageList 
                key={currentSession?.id || 'no-session'}
                messages={currentMessages} 
                typing={typing && state.sending}
                bottomRef={bottomRef}
              />
            </div>

            {/* Bottom dock (centered input, no gray) */}
            <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-transparent px-3 py-3 flex justify-center">
              <div className="w-full max-w-[560px]">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSendMessage}
                  sending={state.sending}
                  disabled={!sessionId || !inputValue.trim()}
                  onLinkChat={() => {}}
                  onAttach={(files) => console.log('Attached files:', files.map(f => f.name))}
                  onLinkResource={handleLinkSession}
                  linkDisabled={!selectedNoteId || !sessionId}
                  className="w-full"
                  noteId={selectedNoteId || undefined}
                  sessionId={sessionId || undefined}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Delete Note</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteNote(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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