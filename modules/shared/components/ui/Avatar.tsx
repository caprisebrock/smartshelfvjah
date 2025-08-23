// COPY THIS ENTIRE FILE FROM: components/ui/Avatar.tsx
// Move the complete contents of components/ui/Avatar.tsx into this file 
import React from 'react';

export default function Avatar({ kind }: { kind: 'user' | 'assistant' }) {
  const isUser = kind === 'user';
  return (
    <div
      className={`shrink-0 grid place-items-center h-8 w-8 rounded-full 
        ${isUser ? 'bg-indigo-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}
      aria-hidden
    >
      {isUser ? 'U' : 'AI'}
    </div>
  );
} 