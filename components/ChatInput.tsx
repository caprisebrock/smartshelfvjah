import React, { useCallback, useRef } from 'react';
import { Paperclip, Link2, Send } from 'lucide-react';

export type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
  onLinkChat?: () => void;
  onAttach?: (files: File[]) => void;
  placeholder?: string;
  className?: string; // NEW
};

export default function ChatInput({
  value, onChange, onSend,
  sending = false, disabled = false,
  onLinkChat, onAttach,
  placeholder = 'Type your message...',
  className
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !sending && value.trim()) onSend();
    }
  }, [disabled, sending, value, onSend]);

  const pickFiles = () => fileInput.current?.click();
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length && onAttach) onAttach(files);
    e.target.value = ''; // reset
  };

  return (
    <div className={['chat-input-root', className].filter(Boolean).join(' ')}>
      <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-zinc-200/70 dark:border-zinc-800/70
                      backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70">
        <input ref={fileInput} type="file" className="hidden" multiple onChange={onFiles} />
        <div className="mx-auto max-w-5xl px-3 sm:px-6 py-3">
          <div className="relative flex items-end gap-2">
            {/* pill input */}
            <div className="flex-1 relative">
              <div className="rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 
                              shadow-sm focus-within:shadow-md transition-shadow">
                <div className="flex-1 relative flex items-center">
                  {/* left icons inside pill */}
                  <div className="flex items-center gap-1 pl-3">
                    <button
                      type="button"
                      aria-label="Attach"
                      onClick={pickFiles}
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

                  {/* textarea */}
                  <textarea
                    ref={ref}
                    rows={1}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 resize-none bg-transparent px-3 py-3 outline-none 
                               text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />

                  {/* send button */}
                  <div className="flex items-center pr-2">
                    <button
                      type="button"
                      onClick={onSend}
                      disabled={disabled || sending || !value.trim()}
                      aria-label="Send"
                      className={`h-10 w-10 flex items-center justify-center rounded-full 
                                  ${disabled || sending || !value.trim()
                                    ? 'bg-indigo-600/40 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:scale-[1.03] active:scale-95'} 
                                  text-white transition-transform shadow-sm`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-3 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                Enter to send · Shift+Enter new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 