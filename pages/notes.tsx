import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useUser } from '../lib/useUser';
import { Note, getNotes, createNote, updateNote, debouncedUpdateNote } from '../lib/notes';
import { useChat } from '../lib/ChatContext';
import { getOrCreateNoteSession } from '../lib/notes';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { ArrowLeft, Plus, Search, MessageCircle, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotesPage() {
  const { user } = useUser();
  const { state, sendMessage, openNoteChat } = useChat();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load notes
  useEffect(() => {
    if (!user?.id) return;
    getNotes(user.id).then(setNotes).catch(console.error);
  }, [user?.id]);

  // Update selected note object
  useEffect(() => {
    setSelectedNote(notes.find(n => n.id === selectedNoteId) || null);
  }, [notes, selectedNoteId]);

  // Auto-create session when note is selected
  useEffect(() => {
    if (!selectedNoteId) return;
    
    const setupNoteSession = async () => {
      try {
        await openNoteChat(selectedNoteId);
      } catch (error) {
        console.error('Error setting up note session:', error);
      }
    };
    
    setupNoteSession();
  }, [selectedNoteId, openNoteChat]);

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
      // Create note with title 'Untitled' and content {type: 'plain', text: ''}
      const newNote = await createNote({ title: 'Untitled' });
      const noteWithContent = await updateNote({
        id: newNote.id,
        content: { type: 'plain', text: '' }
      });
      
      setNotes(prev => [noteWithContent, ...prev]);
      setSelectedNoteId(newNote.id);
      
      if (isMobile) {
        setIsMobileDetail(true);
      }
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  };

  const handleUpdateNote = useCallback(async (updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    try {
      // Use debounced update for autosave (600ms delay)
      await debouncedUpdateNote(selectedNote.id, updates);
      
      // Update local state immediately for responsive UI
      const updatedNote = { ...selectedNote, ...updates };
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : updatedNote));
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedNote]);

  const handleInsertToNote = useCallback(async (text: string) => {
    if (!selectedNote) return;
    
    try {
      const currentContent = selectedNote.content;
      let newText = '';
      
      if (currentContent && typeof currentContent === 'object' && currentContent.type === 'plain') {
        newText = currentContent.text + '\n\n' + text;
      } else {
        newText = text;
      }
      
      const updatedNote = await updateNote({
        id: selectedNote.id,
        content: { type: 'plain', text: newText }
      });
      
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error inserting text to note:', error);
    }
  }, [selectedNote]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    if (isMobile) {
      setIsMobileDetail(true);
    }
  };

  const handleBackToList = () => {
    setIsMobileDetail(false);
    setSelectedNoteId(null);
  };

  // Mobile view: Notes list
  if (isMobile && !isMobileDetail) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Head>
          <title>Notes - SmartShelf</title>
        </Head>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-lg font-semibold">Notes</h1>
          </div>
          <button
            onClick={handleNewNote}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Notes List */}
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => handleNoteSelect(note.id)}
                className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="font-medium">{note.title || 'Untitled'}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {note.content?.text ? note.content.text.substring(0, 100) + '...' : 'No content'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile view: Note detail
  if (isMobile && isMobileDetail) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Head>
          <title>Notes - SmartShelf</title>
        </Head>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">Notes</span>
            </button>
          </div>
          <button
            onClick={() => setChatOpen(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Note Editor */}
        {selectedNote ? (
          <div className="p-4">
            <input
              type="text"
              value={selectedNote.title || 'Untitled'}
              onChange={(e) => handleUpdateNote({ title: e.target.value })}
              className="w-full text-xl font-medium bg-transparent border-none outline-none mb-4"
              placeholder="Untitled"
            />
            <textarea
              value={selectedNote.content?.text || ''}
              onChange={(e) => handleUpdateNote({ content: { type: 'plain', text: e.target.value } })}
              className="w-full h-64 p-3 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 resize-none"
              placeholder="Start writing your note..."
            />
            {isSaving && <div className="text-sm text-zinc-500 mt-2">Saving...</div>}
          </div>
        ) : (
          <div className="p-4 text-center text-zinc-500">
            Select a note to start
          </div>
        )}

        {/* Chat Drawer */}
        {chatOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setChatOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-medium">Chat</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
                <div className="flex-1 overflow-hidden">
                  <MessageList 
                    messages={state.messages} 
                    typing={typing && state.sending}
                    onInsertToNote={handleInsertToNote}
                  />
                </div>
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
          </div>
        )}
      </div>
    );
  }

  // Desktop view: 3-pane layout
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
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedNoteId === note.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-medium truncate">{note.title || 'Untitled'}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                    {note.content?.text ? note.content.text.substring(0, 50) + '...' : 'No content'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Note Editor */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
          {selectedNote ? (
            <div className="h-full flex flex-col">
              <div className="p-6">
                <input
                  type="text"
                  value={selectedNote.title || 'Untitled'}
                  onChange={(e) => handleUpdateNote({ title: e.target.value })}
                  className="w-full text-2xl font-medium bg-transparent border-none outline-none mb-6"
                  placeholder="Untitled"
                />
                <textarea
                  value={selectedNote.content?.text || ''}
                  onChange={(e) => handleUpdateNote({ content: { type: 'plain', text: e.target.value } })}
                  className="w-full flex-1 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 resize-none"
                  placeholder="Start writing your note..."
                  style={{ minHeight: '400px' }}
                />
                {isSaving && <div className="text-sm text-zinc-500 mt-3">Saving...</div>}
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
          {selectedNote ? (
            <>
              <div className="flex-1 overflow-hidden">
                <MessageList 
                  messages={state.messages} 
                  typing={typing && state.sending}
                  onInsertToNote={handleInsertToNote}
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
                        handleInsertToNote(lastReply.content);
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
      {selectedNote && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5 mr-2 inline" />
          Open Chat
        </button>
      )}
    </div>
  );
} 