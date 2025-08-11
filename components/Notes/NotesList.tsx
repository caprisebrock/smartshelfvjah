import React, { useEffect, useMemo, useState } from 'react';
import { quickCreateNote, deleteNote, getNotes, Note } from '../../lib/notes';
import { useUser } from '../../lib/useUser';

export default function NotesList({
  selectedId,
  onSelect,
}: {
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const { user } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(n => n.title.toLowerCase().includes(query));
  }, [q, notes]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getNotes(user.id)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const onNew = async () => {
    try {
      const n = await quickCreateNote(user.id);
      setNotes(prev => [n, ...prev]);
      onSelect(n.id);
    } catch (e: any) {
      alert(e.message || 'Failed to create note');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete note and its chat?')) return;
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedId === id) onSelect('');
    } catch (e: any) {
      alert(e.message || 'Failed to delete note');
    }
  };

  return (
    <div className="h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search notes..."
          className="flex-1 text-sm px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        />
        <button onClick={onNew} className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">New Note</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 text-sm text-zinc-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-sm text-zinc-500">No notes</div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              className={`group px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${selectedId === n.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              onClick={() => onSelect(n.id)}
            >
              <div className="truncate flex items-center gap-2"><span>📝</span><span className="truncate">{n.title || 'Untitled'}</span></div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(n.id); }} className="opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-red-500">✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}