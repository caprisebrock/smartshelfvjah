// COPY THIS ENTIRE FILE FROM: components/Notes/NotesEditor.tsx
// Move the complete contents of components/Notes/NotesEditor.tsx into this file 
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { updateNote, Note } from '../services/notesService';

// Simple content JSON textarea for now (TipTap hook-in point)
export default function NotesEditor({
  note,
  onChangeTitle,
  onChangeContent,
}: {
  note: Note | null;
  onChangeTitle: (title: string) => void;
  onChangeContent: (content: any) => void;
}) {
  const [localTitle, setLocalTitle] = useState<string>('');
  const [localContent, setLocalContent] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalTitle(note?.title || 'Untitled');
    setLocalContent(JSON.stringify(note?.content || {}, null, 2));
  }, [note?.id]);

  // debounce autosave
  useEffect(() => {
    if (!note?.id) return;
    const handle = setTimeout(async () => {
      try {
        setSaving(true);
        const parsed = safeParse(localContent);
        await updateNote({ id: note.id, title: localTitle, content: parsed });
        onChangeTitle(localTitle);
        onChangeContent(parsed);
      } catch (e) {
        // ignore for now, caller can handle toast
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => clearTimeout(handle);
  }, [note?.id, localTitle, localContent]);

  if (!note) return <div className="p-4 text-sm text-zinc-500">Select or create a note</div>;

  return (
    <div className="h-full flex flex-col">
      {/* top bar */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur flex items-center gap-2">
        <input
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          className="flex-1 text-lg font-medium bg-transparent outline-none"
        />
        {saving && <span className="text-xs text-zinc-400">Saving…</span>}
      </div>
      {/* editor area */}
      <div className="flex-1 overflow-auto p-4">
        <textarea
          value={localContent}
          onChange={e => setLocalContent(e.target.value)}
          className="w-full h-full text-sm font-mono p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        />
      </div>
    </div>
  );
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return {}; }
}