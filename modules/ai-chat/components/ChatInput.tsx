// COPY THIS ENTIRE FILE FROM: components/ChatInput.tsx
// Move the complete contents of components/ChatInput.tsx into this file 
import React, { useCallback, useRef, useState } from 'react';
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
  className?: string;
  noteId?: string;
  sessionId?: string;
};

export default function ChatInput({
  value, onChange, onSend,
  sending = false, disabled = false,
  onLinkChat, onAttach,
  placeholder = 'Type your message...',
  className,
  noteId,
  sessionId
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('⌨️ Enter key pressed in ChatInput:', {
        disabled: disabled,
        sending: sending,
        value: `"${value}"`,
        valueTrimmed: `"${value.trim()}"`,
        willSend: !disabled && !sending && value.trim(),
        onSendExists: typeof onSend === 'function',
        onSendName: onSend?.name || 'anonymous'
      });
      e.preventDefault();
      if (!disabled && !sending && value.trim()) {
        console.log('🚀 Enter key triggering onSend');
        console.log('🎯 About to call onSend function:', onSend);
        onSend();
        console.log('✅ onSend function called');
      } else {
        console.log('❌ Enter key blocked - conditions not met');
      }
    }
  }, [disabled, sending, value, onSend]);

  const pickFiles = () => fileInput.current?.click();
  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length && onAttach) onAttach(files);
    e.target.value = ''; // reset
  };

  const handleLinkResource = () => {
    setLinkOpen(true);
    // TODO: Open LinkResourcePicker modal here
    // This will be implemented when we have the modal component
    console.log('Opening link resource picker for note:', noteId, 'session:', sessionId);
  };

  return (
    <div className={[
      "chat-input-root w-full bg-transparent", // keep transparent
      className,
    ].filter(Boolean).join(" ")}>
      <div className="relative">
        <input 
          ref={fileInput} 
          type="file" 
          multiple 
          accept="image/*,application/pdf,text/plain,application/zip,application/json"
          // On mobile Safari/Chrome this can prompt camera; desktop will ignore.
          capture={/iPhone|iPad|Android/i.test(navigator.userAgent) ? "environment" : undefined}
          onChange={onFiles} 
          className="hidden" 
        />
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
                    aria-label="Attach files or take photo"
                    onClick={pickFiles}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Paperclip className="h-5 w-5 text-zinc-500" />
                  </button>
                  <button
                    type="button"
                    aria-label="Link resource"
                    onClick={handleLinkResource}
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
                    onClick={() => {
                      console.log('🖱️ Send button clicked:', {
                        disabled: disabled,
                        sending: sending,
                        value: `"${value}"`,
                        buttonDisabled: disabled || sending || !value.trim()
                      });
                      onSend();
                    }}
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
  );
} 