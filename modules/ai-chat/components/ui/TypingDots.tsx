// COPY THIS ENTIRE FILE FROM: components/ui/TypingDots.tsx
// Move the complete contents of components/ui/TypingDots.tsx into this file 
import React from 'react';

export default function TypingDots() {
  return (
    <span className="inline-flex gap-1 px-3 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.2s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
    </span>
  );
} 