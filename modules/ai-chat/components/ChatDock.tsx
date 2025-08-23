// COPY THIS ENTIRE FILE FROM: components/ChatDock.tsx
// Move the complete contents of components/ChatDock.tsx into this file 
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

interface ChatDockProps {
  noteId?: string;
  className?: string;
}

export default function ChatDock({ noteId, className }: ChatDockProps) {
  const { state, sendMessage, loadSession, ensureNoteSession } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Handle note-scoped session management
  useEffect(() => {
    if (!noteId) return;

    const setupNoteSession = async () => {
      try {
        // Ensure we have a session for this note
        const sessionId = await ensureNoteSession(noteId);
        if (sessionId) {
          // Load the session and its messages
          await loadSession(sessionId);
        }
      } catch (error) {
        console.error('Failed to setup note session:', error);
      }
    };

    setupNoteSession();
  }, [noteId, ensureNoteSession, loadSession]);

  // Auto-scroll to bottom on new messages unless user has scrolled up
  useEffect(() => {
    if (!userScrolledUp && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages.length, userScrolledUp]);

  // Track user scroll position to determine if we should auto-scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setUserScrolledUp(!isNearBottom);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sending messages
  const handleSend = async () => {
    if (!inputValue.trim() || !state.currentSession) return;

    setInputValue('');
    setTyping(true);

    try {
      await sendMessage(inputValue.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setTyping(false);
    }
  };

  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {state.currentSession?.title || 'Chat'}
          </span>
        </div>
        {noteId && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Note Chat
          </div>
        )}
      </div>

      {/* Messages container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 min-h-0"
      >
        <div className="mx-auto max-w-5xl py-6 space-y-2">
          <MessageList 
            messages={state.messages}
            typing={typing}
          />
          {/* Scroll anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input container */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <div className="mx-auto max-w-5xl">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            sending={state.sending}
            disabled={!state.currentSession || !inputValue.trim()}
            placeholder="Type your message..."
            className="w-full"
            noteId={noteId}
            sessionId={state.currentSession?.id}
          />
        </div>
      </div>
    </div>
  );
} 