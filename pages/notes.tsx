import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const TONE_OPTIONS = ['All', 'Summarized', 'Detailed', 'Bullet Points', 'Insights'] as const;
type ToneType = typeof TONE_OPTIONS[number];

interface AiNote {
  id: string;
  resourceTitle: string;
  emoji: string;
  tone: string;
  noteText: string;
  reflection?: string;
  dateSaved: string;
}

function getEmojiForTitle(title = ''): string {
  if (/atomic|book|read/i.test(title)) return '📖';
  if (/podcast|audio/i.test(title)) return '🎧';
  if (/course|class/i.test(title)) return '💻';
  if (/video|watch/i.test(title)) return '📺';
  if (/article|blog/i.test(title)) return '📰';
  return '📝';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function NotesPage() {
  const [aiNotes, setAiNotes] = useState<AiNote[]>([]);
  const [filterTone, setFilterTone] = useState<ToneType>('All');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [showReflectId, setShowReflectId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string>('');

  // Load notes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aiNotes');
      if (!raw) {
        setAiNotes([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setAiNotes(parsed as AiNote[]);
      } else {
        setAiNotes([]);
      }
    } catch {
      setAiNotes([]);
    }
  }, []);

  // Save notes to localStorage
  const persistNotes = (notes: AiNote[]): void => {
    setAiNotes(notes);
    localStorage.setItem('aiNotes', JSON.stringify(notes));
  };

  // Edit
  const handleEdit = (id: string, noteText: string): void => {
    setEditId(id);
    setEditText(noteText);
  };
  const handleSaveEdit = (id: string): void => {
    const updated = aiNotes.map(n => n.id === id ? { ...n, noteText: editText } : n);
    persistNotes(updated);
    setEditId(null);
    setEditText('');
  };

  // Delete
  const handleDelete = (id: string): void => {
    const updated = aiNotes.filter(n => n.id !== id);
    persistNotes(updated);
    setShowDeleteId(null);
  };

  // Reflect
  const handleReflect = (id: string, currentReflection: string = ''): void => {
    setShowReflectId(id);
    setReflectionText(currentReflection);
  };
  const handleSaveReflection = (id: string): void => {
    const updated = aiNotes.map(n => n.id === id ? { ...n, reflection: reflectionText } : n);
    persistNotes(updated);
    setShowReflectId(null);
    setReflectionText('');
  };

  // Filter
  const filteredNotes = aiNotes.filter(note =>
    filterTone === 'All' ? true : note.tone === filterTone
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Notes - SmartShelf</title>
        <meta name="description" content="Log your business and marketing insights" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Learning Notes</h1>
            <p className="text-gray-600">Capture insights from your audiobooks and AI Assistant</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* AI Notes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-purple-700">AI Notes <span className="text-base font-normal text-gray-500">({aiNotes.length})</span></h2>
            <div className="flex gap-2">
              {TONE_OPTIONS.map(tone => (
                <button
                  key={tone}
                  onClick={() => setFilterTone(tone)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border
                    ${filterTone === tone ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center text-gray-500 min-h-[200px]">
              <h3 className="text-lg font-semibold mb-2">You have no notes yet. Add a resource first or try ✨ Generate Notes with AI from a learning item.</h3>
            </div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {filteredNotes.map(note => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2 relative"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{note.emoji || getEmojiForTitle(note.resourceTitle)}</span>
                      <span className="font-bold text-gray-900 text-lg">{note.resourceTitle}</span>
                      <span className="text-gray-400 text-sm">{formatDate(note.dateSaved)}</span>
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">{note.tone}</span>
                    </div>
                    {editId === note.id ? (
                      <>
                        <textarea
                          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all min-h-[80px] mb-2"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            className="px-4 py-1 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                          >Save</button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-4 py-1 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                          >Cancel</button>
                        </div>
                      </>
                    ) : (
                      <div className="prose max-w-none text-gray-800 whitespace-pre-line mb-2">{note.noteText}</div>
                    )}
                    {note.reflection && (
                      <div className="italic text-gray-500 bg-gray-50 rounded-lg p-3 mt-2 text-sm border border-gray-100">
                        <span className="font-medium text-purple-700">Reflection:</span> {note.reflection}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(note.id, note.noteText)}
                        className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 font-medium hover:bg-blue-200 transition-colors text-sm"
                      >Edit</button>
                      <button
                        onClick={() => setShowDeleteId(note.id)}
                        className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors text-sm"
                      >Delete</button>
                      <button
                        onClick={() => handleReflect(note.id, note.reflection)}
                        className="px-3 py-1 rounded-lg bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 transition-colors text-sm"
                      >Reflect</button>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteId === note.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-2 p-0 overflow-hidden flex flex-col animate-fadeIn">
                          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50">
                            <span className="text-lg font-bold text-red-700">Delete Note</span>
                            <button
                              className="text-gray-400 hover:text-gray-700 text-lg"
                              onClick={() => setShowDeleteId(null)}
                              aria-label="Close"
                            >×</button>
                          </div>
                          <div className="px-6 py-8">
                            <p className="mb-6 text-gray-700">Are you sure you want to delete this note? This action cannot be undone.</p>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setShowDeleteId(null)}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                              >Cancel</button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reflection Modal */}
                    {showReflectId === note.id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 p-0 overflow-hidden flex flex-col animate-fadeIn">
                          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-purple-50">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">💭</span>
                              <span className="text-lg font-bold text-purple-800">Reflect on this Note</span>
                            </div>
                            <button
                              className="text-gray-400 hover:text-gray-700 text-lg"
                              onClick={() => setShowReflectId(null)}
                              aria-label="Close"
                            >×</button>
                          </div>
                          <div className="flex-1 flex flex-col gap-6 px-6 py-8 bg-purple-50">
                            <label className="block text-sm font-medium text-gray-700 mb-1">What did you learn from this? How will you apply it?</label>
                            <textarea
                              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all min-h-[80px]"
                              value={reflectionText}
                              onChange={e => setReflectionText(e.target.value)}
                              placeholder="Type your reflection here..."
                            />
                            <button
                              onClick={() => handleSaveReflection(note.id)}
                              className="w-full rounded-xl bg-purple-500 text-white py-3 text-base font-semibold hover:bg-purple-600 transition-colors"
                            >Save Reflection</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 