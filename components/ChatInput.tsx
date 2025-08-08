// components/ChatInput.tsx
import React, { useCallback, useRef } from 'react';
import { Paperclip, Link2, Send } from 'lucide-react';

export type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
  onLinkChat?: () => void;
  onAttach?: () => void;
  placeholder?: string;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  sending = false,
  disabled = false,
  onLinkChat,
  onAttach,
  placeholder = 'Type your message here...'
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && !sending && value.trim()) onSend();
      }
    },
    [disabled, sending, value, onSend]
  );

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70 bg-white dark:bg-zinc-900 border-t border-zinc-200/70 dark:border-zinc-800/70">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-3">
        <div className="relative flex items-end gap-2">
          {/* Toolbar (left) */}
          <div className="hidden sm:flex items-center gap-2 pl-1">
            <button
              type="button"
              aria-label="Attach"
              onClick={onAttach}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <Paperclip className="h-5 w-5 text-zinc-500" />
            </button>
            <button
              type="button"
              aria-label="Link Chat"
              onClick={onLinkChat}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <Link2 className="h-5 w-5 text-zinc-500" />
            </button>
          </div>

          {/* Pill input */}
          <div className="flex-1 relative">
            <div className="rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:shadow-md transition-shadow">
              <textarea
                ref={ref}
                rows={1}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full resize-none bg-transparent px-5 pr-16 py-3 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 align-middle"
              />
              {/* Send button (inside pill, right) */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={onSend}
                  disabled={disabled || sending || !value.trim()}
                  aria-label="Send"
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-95 transition-transform shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="px-3 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              Press <span className="font-medium">Enter</span> to send, <span className="font-medium">Shift+Enter</span> for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 