import React, { useEffect, useRef, useState } from 'react';

export default function ResizablePanel({
  left,
  right,
  storageKey = 'notes.chatWidth'
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  storageKey?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chatWidth, setChatWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 420;
    const saved = Number(localStorage.getItem(storageKey));
    return Number.isFinite(saved) && saved > 0 ? saved : 420;
  });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, String(chatWidth));
  }, [chatWidth, storageKey]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left; // left width
      const newRight = rect.width - x;
      setChatWidth(Math.max(280, Math.min(newRight, Math.max(320, rect.width * 0.6))));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const isCollapsed = chatWidth < 320;

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {left}
      </div>
      {/* divider */}
      <div
        onMouseDown={() => setDragging(true)}
        className={`w-1.5 cursor-col-resize bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition ${dragging ? 'bg-zinc-400 dark:bg-zinc-600' : ''}`}
        aria-label="Resize chat panel"
      />
      {/* right panel */}
      <div style={{ width: isCollapsed ? 0 : chatWidth }} className={`relative overflow-hidden transition-[width] duration-200 ${isCollapsed ? 'border-l-0' : 'border-l border-zinc-200 dark:border-zinc-800'}`}>
        {!isCollapsed && (
          <div className="h-full w-full">
            {right}
          </div>
        )}
        <button
          type="button"
          onClick={() => setChatWidth(isCollapsed ? 420 : 0)}
          className="absolute top-2 -left-3 z-10 h-6 w-6 grid place-items-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow"
          aria-label={isCollapsed ? 'Expand chat' : 'Collapse chat'}
          title={isCollapsed ? 'Expand chat' : 'Collapse chat'}
        >
          {isCollapsed ? '‹' : '›'}
        </button>
      </div>
    </div>
  );
}