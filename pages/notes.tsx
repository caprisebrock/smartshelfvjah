import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Filter, Edit3, Trash2, MessageCircle, Plus } from 'lucide-react';
import BackButton from '../components/BackButton';

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
    <>
      <Head>
        <title>Notes - SmartShelf</title>
        <meta name="description" content="Log your business and marketing insights" />
      </Head>
      <div className="min-h-screen bg-gray-50 animate-fadeIn">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Notes</h1>
              </div>
              <p className="text-gray-600">Capture insights from your audiobooks and AI Assistant</p>
            </div>
          </div>

          {/* Stats and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {/* Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 mb-1">{aiNotes.length}</div>
                  <div className="text-sm text-purple-600">Total Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-1">{filteredNotes.length}</div>
                  <div className="text-sm text-blue-600">Filtered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {aiNotes.filter(n => n.reflection).length}
                  </div>
                  <div className="text-sm text-green-600">With Reflections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700 mb-1">
                    {new Set(aiNotes.map(n => n.resourceTitle)).size}
                  </div>
                  <div className="text-sm text-orange-600">Resources</div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by tone:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map(tone => (
                  <button
                    key={tone}
                    onClick={() => setFilterTone(tone)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                      filterTone === tone 
                        ? 'bg-purple-100 text-purple-800 shadow-md border border-purple-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    {tone}
                    {tone !== 'All' && (
                      <span className="ml-1 px-2 py-0.5 bg-white rounded-full text-xs">
                        {aiNotes.filter(n => n.tone === tone).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {filteredNotes.length === 0 ? (
              <div className="card-gradient">
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No notes yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                    {filterTone === 'All' 
                      ? "You haven't created any notes yet. Add a resource first or try generating notes with AI from a learning item."
                      : `No notes found with "${filterTone}" tone. Try a different filter or create some notes first.`
                    }
                  </p>
                  <Link href="/my-learning" className="btn-primary group">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Resource
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="card-interactive"
                    >
                      <div className="p-6">
                        {/* Note Header */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            {note.emoji || getEmojiForTitle(note.resourceTitle)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{note.resourceTitle}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{formatDate(note.dateSaved)}</span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {note.tone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Note Content */}
                        {editId === note.id ? (
                          <div className="mb-4">
                            <textarea
                              className="textarea-field min-h-[120px] mb-4"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              placeholder="Edit your note..."
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleSaveEdit(note.id)}
                                className="btn-success"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="prose max-w-none text-gray-800 mb-4 leading-relaxed whitespace-pre-line">
                            {note.noteText}
                          </div>
                        )}

                        {/* Reflection */}
                        {note.reflection && (
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4 border border-purple-100">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-purple-900">Personal Reflection</span>
                            </div>
                            <p className="text-purple-800 text-sm leading-relaxed italic">
                              {note.reflection}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleEdit(note.id, note.noteText)}
                            className="btn-ghost group"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteId(note.id)}
                            className="btn-ghost text-red-600 hover:text-red-800 hover:bg-red-50 group"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                          <button
                            onClick={() => handleReflect(note.id, note.reflection)}
                            className="btn-ghost text-purple-600 hover:text-purple-800 hover:bg-purple-50 group"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {note.reflection ? 'Edit Reflection' : 'Add Reflection'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Note</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this note? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteId(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteId)}
                    className="btn-danger"
                  >
                    Delete Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reflection Modal */}
        {showReflectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Add Reflection</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  What did you learn from this note? How will you apply it?
                </p>
                <textarea
                  className="textarea-field min-h-[120px] mb-6"
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="Share your thoughts and insights..."
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowReflectId(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveReflection(showReflectId)}
                    className="btn-primary"
                  >
                    Save Reflection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 