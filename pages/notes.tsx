import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import ResizablePanel from '../components/Notes/ResizablePanel';
import NotesList from '../components/Notes/NotesList';
import NotesEditor from '../components/Notes/NotesEditor';
import LinkedResourceBadge from '../components/Notes/LinkedResourceBadge';
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

  const handleOpenChat = () => {
    if (selectedNoteId) {
      window.location.href = `/aichat?noteId=${selectedNoteId}`;
    }
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

      {/* 3-Pane Layout */}
      <div className="grid grid-cols-[280px,1fr,420px] h-[calc(100vh-80px)]">
        {/* Left: Notes List */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="font-medium mb-3">Notes</h2>
            <div className="space-y-2">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors group relative ${
                    selectedNoteId === note.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div onClick={() => selectNote(note.id)}>
                    <div className="font-medium truncate">{note.title || 'Untitled'}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                      {note.content?.text ? note.content.text.substring(0, 50) + '...' : 'No content'}
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
              ))}
            </div>
          </div>
        </div>

        {/* Center: Note Editor */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
          {selectedNoteId ? (
            <div className="h-full flex flex-col">
              <div className="p-6">
                <input
                  type="text"
                  value={currentDraft?.title || 'Untitled'}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="w-full text-2xl font-medium bg-transparent border-none outline-none mb-6"
                  placeholder="Untitled"
                />
                <textarea
                  value={currentDraft?.content?.text || ''}
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

        {/* Right: Chat Dock */}
        <div className="bg-white dark:bg-zinc-900 overflow-y-auto">
          {selectedNoteId ? (
            <>
              <div className="flex-1 overflow-hidden">
                <MessageList 
                  messages={state.messages} 
                  typing={typing && state.sending}
                  onInsertToNote={() => {}} // No direct insert to note from here, handled by editor
                />
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSendMessage}
                  sending={state.sending}
                  disabled={!state.currentSession}
                  onLinkChat={() => {}}
                  onAttach={(files) => console.log('Attached files:', files.map(f => f.name))}
                />
                {state.messages.some(m => m.sender === 'assistant') && (
                  <button
                    onClick={() => {
                      const lastReply = state.messages
                        .filter(m => m.sender === 'assistant')
                        .pop();
                      if (lastReply) {
                        onContentChange(lastReply.content);
                      }
                    }}
                    className="w-full mt-3 px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    Insert last reply
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <div className="text-4xl mb-4">💬</div>
                <div className="text-lg font-medium mb-2">Open Chat to brainstorm</div>
                <div className="text-sm">Select a note to start chatting</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating "Open Chat" pill when chat is collapsed */}
      {selectedNoteId && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5 mr-2 inline" />
          Open Chat
        </button>
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