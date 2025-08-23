// COPY THIS ENTIRE FILE FROM: components/Notes/LinkedResourceBadge.tsx
// Move the complete contents of components/Notes/LinkedResourceBadge.tsx into this file 
import React, { useEffect, useState } from 'react';
import { supabase } from '../../database/config/databaseConfig';

export default function LinkedResourceBadge({ resourceId }: { resourceId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [resource, setResource] = useState<any | null>(null);

  useEffect(() => {
    if (!resourceId) return;
    (async () => {
      const { data } = await supabase
        .from('learning_resources')
        .select('id, type, title, author, total_minutes, minutes_completed, streak_days')
        .eq('id', resourceId)
        .single();
      setResource(data || null);
    })();
  }, [resourceId]);

  if (!resourceId) return null;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
      >
        <span>{resource?.type === 'habit' ? '🎯' : '📚'}</span>
        <span>{resource?.title || 'Linked resource'}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-4">
            <div className="text-sm font-medium mb-2">Linked Resource</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <div><strong>Type:</strong> {resource?.type || '—'}</div>
              <div><strong>Title:</strong> {resource?.title || '—'}</div>
              <div><strong>Creator:</strong> {resource?.author || '—'}</div>
              <div><strong>Total minutes:</strong> {resource?.total_minutes ?? '—'}</div>
              <div><strong>Completed:</strong> {resource?.minutes_completed ?? '—'}</div>
              <div><strong>Streak days:</strong> {resource?.streak_days ?? '—'}</div>
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}