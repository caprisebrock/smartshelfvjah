import React, { useRef, useState, useCallback } from 'react';
import { Send, Paperclip, Link } from 'lucide-react';

interface NotesChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
  className?: string;
}

export default function NotesChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  sending = false,
  placeholder = "Ask about this note...",
  className = ""
}: NotesChatInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  
  // Component render (debug removed)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log('🔤 Key pressed:', e.key, 'Shift:', e.shiftKey);
    
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('✅ Enter detected (no shift)');
      console.log('📋 Conditions check:', {
        disabled: disabled,
        sending: sending,
        value: `"${value}"`,
        valueTrim: `"${value.trim()}"`,
        hasValue: !!value.trim(),
        onSendExists: !!onSend,
        onSendType: typeof onSend
      });
      
      e.preventDefault();
      
      if (!disabled && !sending && value.trim()) {
        console.log('🚀 NOTES Enter key sending message - calling onSend()');
        onSend();
        console.log('✅ onSend() called');
      } else {
        console.log('❌ Enter blocked:', {
          blockedByDisabled: disabled,
          blockedBySending: sending,
          blockedByNoValue: !value.trim()
        });
      }
    } else {
      console.log('❌ Not Enter or Shift+Enter');
    }
  }, [disabled, sending, value, onSend]);

  const handleSendClick = useCallback(() => {
    if (!disabled && !sending && value.trim()) {
      console.log('🚀 NOTES Send button clicked');
      onSend();
    }
  }, [disabled, sending, value, onSend]);

  return (
    <div className={`relative flex items-end gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg ${className}`}>
      {/* Text Input */}
      <div className="flex-1 relative">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            console.log('🔥 onKeyDown fired:', e.key);
            handleKeyDown(e);
          }}
          onKeyPress={(e) => {
            console.log('🔥 onKeyPress fired:', e.key);
            if (e.key === 'Enter' && !e.shiftKey) {
              console.log('🚀 BACKUP: onKeyPress Enter detected');
              e.preventDefault();
              if (!disabled && !sending && value.trim()) {
                console.log('🚀 BACKUP: Calling onSend from onKeyPress');
                onSend();
              }
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-3 outline-none 
                     text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            minHeight: '44px',
            maxHeight: '120px'
          }}
        />
      </div>

      {/* Send Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleSendClick}
          disabled={disabled || sending || !value.trim()}
          aria-label="Send message"
          className={`h-10 w-10 flex items-center justify-center rounded-full 
                      ${disabled || sending || !value.trim()
                        ? 'bg-blue-400 cursor-not-allowed opacity-50'
                        : 'bg-blue-500 hover:bg-blue-600 hover:scale-[1.03] active:scale-95'} 
                      text-white transition-all shadow-sm`}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
