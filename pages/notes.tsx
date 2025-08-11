import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import ResizablePanel from '../components/Notes/ResizablePanel';
import NotesList from '../components/Notes/NotesList';
import NotesEditor from '../components/Notes/NotesEditor';
import LinkedResourceBadge from '../components/Notes/LinkedResourceBadge';
import { useUser } from '../lib/useUser';
import { Note, getNotes, createNote, updateNote, deleteNote } from '../lib/notes';
import { useChat } from '../lib/ChatContext';
import { getOrCreateNoteSession } from '../lib/chatNoteBridge';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotesPage() {
  const { user } = useUser();
  const { state, sendMessage, setCurrentSessionId } = useChat();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes
  useEffect(() => {
    if (!user?.id) return;
    getNotes(user.id).then(setNotes).catch(console.error);
  }, [user?.id]);

  // Update selected note object
  useEffect(() => {
    setSelectedNote(notes.find(n => n.id === selectedNoteId) || null);
  }, [notes, selectedNoteId]);

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
      const newNote = await createNote({ title: 'Untitled' });
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleUpdateNote = async (updates: Partial<Note>) => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    try {
      const updatedNote = await updateNote({
        id: selectedNote.id,
        ...updates
      });
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
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
        <button
          onClick={handleNewNote}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          New Note
        </button>
      </div>

      <div className="flex-1">
        <ResizablePanel
          left={
            <div className="h-full" style={{ width: 280 }}>
              <NotesList 
                selectedId={selectedNoteId} 
                onSelect={setSelectedNoteId}
              />
            </div>
          }
          right={
            <div className="h-full flex">
              {/* Center: Note Editor */}
              <div className="flex-1 border-r border-zinc-200 dark:border-zinc-800">
                {selectedNote ? (
                  <div className="h-full flex flex-col">
                    {selectedNote.linked_resource_id && (
                      <div className="px-4 pt-4">
                        <LinkedResourceBadge resourceId={selectedNote.linked_resource_id} />
                      </div>
                    )}
                    <NotesEditor
                      note={selectedNote}
                      onChangeTitle={(title) => handleUpdateNote({ title })}
                      onChangeContent={(content) => handleUpdateNote({ content })}
                    />
                  </div>
                ) : (
                  <div className="h-full grid place-items-center text-sm text-zinc-500 dark:text-zinc-400">
                    Select a note or create a new one
                  </div>
                )}
              </div>

              {/* Right: Docked AI Chat */}
              <div className="w-[420px] flex flex-col border-l border-zinc-200 dark:border-zinc-800">
                {selectedNote ? (
                  <>
                    <div className="flex-1 overflow-hidden">
                      <MessageList 
                        messages={state.messages} 
                        typing={typing && state.sending} 
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
                  </>
                ) : (
                  <div className="h-full grid place-items-center text-sm text-zinc-500 dark:text-zinc-400">
                    Chat will appear here when a note is selected
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
} 