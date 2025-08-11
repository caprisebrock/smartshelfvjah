import React, { useEffect, useRef } from 'react';
import Avatar from './ui/Avatar';
import TypingDots from './ui/TypingDots';

type Msg = {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string | Date;
};

export default function MessageList({
  messages,
  typing = false,
  onInsertToNote
}: { 
  messages: Msg[]; 
  typing?: boolean;
  onInsertToNote?: (text: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    wrapRef.current?.scrollTo({ top: wrapRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  let lastDate: Date | null = null;

  return (
    <div ref={wrapRef} className="flex-1 overflow-y-auto px-3 sm:px-6">
      <div className="mx-auto max-w-5xl py-6 space-y-4">
        {messages.map((m) => {
          const d = new Date(m.created_at);
          const needsDivider = !lastDate || !sameDay(lastDate, d);
          lastDate = d;

          return (
            <React.Fragment key={m.id}>
              {needsDivider && (
                <div className="sticky top-2 z-[1] flex justify-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && <Avatar kind="assistant" />}
                <div className={`group max-w-[70%] rounded-2xl px-4 py-2 leading-relaxed
                                ${m.sender === 'user'
                                  ? 'bg-indigo-600 text-white rounded-br-md'
                                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-md'}`}>
                  {m.content}
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition text-[10px] text-zinc-400">
                    {d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  {m.sender === 'assistant' && onInsertToNote && (
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onInsertToNote(m.content)}
                        className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        Insert to Note
                      </button>
                    </div>
                  )}
                </div>
                {m.sender === 'user' && <Avatar kind="user" />}
              </div>
            </React.Fragment>
          );
        })}
        {typing && (
          <div className="flex gap-3 justify-start">
            <Avatar kind="assistant" />
            <TypingDots />
          </div>
        )}
      </div>
    </div>
  );
} 