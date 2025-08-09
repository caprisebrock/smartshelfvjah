import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import ResizablePanel from '../components/Notes/ResizablePanel';
import NotesList from '../components/Notes/NotesList';
import NotesEditor from '../components/Notes/NotesEditor';
import LinkedResourceBadge from '../components/Notes/LinkedResourceBadge';
import { useUser } from '../lib/useUser';
import { Note, getNotes } from '../lib/notes';
import { useChat } from '../lib/ChatContext';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';

export default function NotesPage() {
  const { user } = useUser();
  const { state, sendMessage, ensureNoteSession } = useChat();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);

  // Load notes
  useEffect(() => {
    if (!user?.id) return;
    getNotes(user.id).then(setNotes).catch(console.error);
  }, [user?.id]);

  // Update selected note object
  useEffect(() => {
    setSelectedNote(notes.find(n => n.id === selectedNoteId) || null);
  }, [notes, selectedNoteId]);

  // Ensure note session exists and is current
  useEffect(() => {
    if (!selectedNoteId) return;
    ensureNoteSession(selectedNoteId).catch(console.error);
  }, [selectedNoteId]);

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

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Head>
        <title>Notes - SmartShelf</title>
      </Head>

      <div className="flex-1">
        <ResizablePanel
          left={
            <div className="h-full" style={{ width: 280 }}>
              <NotesList selectedId={selectedNoteId} onSelect={setSelectedNoteId} />
            </div>
          }
          right={
            <div className="h-full flex flex-col">
              <div className="flex-1 flex">
                {/* center editor */}
                <div className="flex-1 border-r border-zinc-200 dark:border-zinc-800">
                  {selectedNote && (
                    <div className="h-full flex flex-col">
                      {selectedNote.linked_resource_id && (
                        <div className="px-4 pt-2">
                          <LinkedResourceBadge resourceId={selectedNote.linked_resource_id} />
                        </div>
                      )}
                      <NotesEditor
                        note={selectedNote}
                        onChangeTitle={(t) => setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title: t } as Note : n))}
                        onChangeContent={(c) => setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, content: c } as Note : n))}
                      />
                    </div>
                  )}
                  {!selectedNote && (
                    <div className="h-full grid place-items-center text-sm text-zinc-500">Select a note</div>
                  )}
                </div>

                {/* right chat panel */}
                <div className="w-[420px] flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <MessageList messages={state.messages as any} typing={typing && state.sending} />
                    <ChatInput
                      value={inputValue}
                      onChange={setInputValue}
                      onSend={handleSendMessage}
                      sending={state.sending}
                      disabled={!state.currentSession}
                      onLinkChat={() => {}}
                      onAttach={(files) => console.log(files.map(f => f.name))}
                    />
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
} 