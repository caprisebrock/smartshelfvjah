import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../lib/useUser';
import { Note, getNotes, createNote, getNoteById, updateNoteFast, deleteNoteById } from '../lib/notes';
import { useChat } from '../lib/ChatContext';
import { getOrCreateNoteSession } from '../lib/chatNoteBridge';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { ArrowLeft, Plus, Search, MessageCircle, X, ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Simple debounce utility
  const debounce = <T extends (...args: any[]) => void>(fn: T, ms = 700) => {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

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

  // Note selection logic
  const selectNote = useCallback(async (id: string) => {
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
  }, [notes, drafts]);

  // Ensure note session exists and set as current when note is selected
  useEffect(() => {
    if (!selectedNoteId) return;
    
    const setupNoteSession = async () => {
      try {
        const session = await getOrCreateNoteSession(selectedNoteId);
        await setCurrentSessionId(session.id);
      } catch (error) {
        console.error('Error setting up note session:', error);
      }
    };
    
    setupNoteSession();
  }, [selectedNoteId, setCurrentSessionId]);

  // Change handlers
  const onTitleChange = useCallback((val: string) => {
    if (!selectedNoteId) return;
    setDrafts(prev => {
      const next = { 
        ...(prev[selectedNoteId] ?? { title: 'Untitled', content: {} }), 
        title: val 
      };
      const all = { ...prev, [selectedNoteId]: next };
      // Fire debounced save for ONLY this note
      saveSelected(selectedNoteId, next);
      return all;
    });
  }, [selectedNoteId, saveSelected]);

  const onContentChange = useCallback((nextContent: any) => {
    if (!selectedNoteId) return;
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

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || state.sending) return;
    setInputValue('');
    setTyping(true);
    try {
      await sendMessage(text);
    } finally {
      setTyping(false);
    }
  };

  const handleNewNote = async () => {
    if (!user?.id) return;
    try {
      const newNote = await createNote(user.id);
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
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current draft
  const currentDraft = selectedNoteId ? drafts[selectedNoteId] : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Head>
        <title>Notes - SmartShelf</title>
      </Head>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-semibold">Notes</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 w-64"
            />
          </div>
          <button
            onClick={handleNewNote}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            New Note
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-[280px_1fr_360px] gap-4 h-[calc(100vh-64px)] px-4">
        {/* Left: Notes List */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="font-medium mb-3">Notes</h2>
            <div className="space-y-2">
              {filteredNotes.map(note => {
                // Get preview from drafts if available, otherwise from note data
                const draft = drafts[note.id];
                const previewTitle = draft?.title ?? note.title;
                const previewContent = draft?.content?.text ?? note.content?.text;
                
                return (
                  <div
                    key={note.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors group relative ${
                      selectedNoteId === note.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div onClick={() => selectNote(note.id)}>
                      <div className="font-medium truncate">{previewTitle || 'Untitled'}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                        {previewContent ? previewContent.substring(0, 50) + '...' : 'No content'}
                      </div>
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
          </div>
        </div>

        {/* Center: Note Editor */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          {selectedNoteId && currentDraft ? (
            <div className="h-full flex flex-col">
              <div className="p-6">
                <input
                  type="text"
                  value={currentDraft.title || 'Untitled'}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full text-2xl font-medium bg-transparent border-none outline-none mb-6"
                  placeholder="Untitled"
                />
                <textarea
                  value={currentDraft.content?.text || ''}
                  onChange={(e) => onContentChange({ type: 'plain', text: e.target.value })}
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
        </div>

        {/* Right: Chat Panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col">
          {selectedNoteId && currentDraft ? (
            <>
              {/* Chat Context Line */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-300">
                  Chat for: <span className="font-medium">{currentDraft.title || 'Untitled'}</span>
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                  <MessageList 
                    messages={state.messages} 
                    typing={typing && state.sending}
                  />
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
                  <ChatInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSendMessage}
                    sending={state.sending}
                    disabled={!state.currentSession}
                    onLinkChat={() => {}}
                    onAttach={(files) => console.log('Attached files:', files.map(f => f.name))}
                  />
                </div>
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
        </div>
      </div>

      {/* Open Chat Button - positioned in normal flow, not floating */}
      {selectedNoteId && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={openChatForSelected}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 mr-2 inline" />
            Open Chat
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-sm mx-4">
            <div className="text-lg font-medium mb-4">Delete Note</div>
            <div className="text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
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