// COPY THIS ENTIRE FILE FROM: hooks/useAutoNameSession.ts
// Move the complete contents of hooks/useAutoNameSession.ts into this file 
import { useEffect, useRef } from 'react';
import { supabase } from '../../database/config/databaseConfig';

interface Message {
  id: string;
  content: string;
  created_at: string;
  role?: 'user' | 'assistant';
}

export function useAutoNameSession(messages: Message[], sessionId?: string, currentTitle?: string) {
  const hasNamedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || typeof sessionId !== 'string' || hasNamedRef.current || !messages || currentTitle !== 'Untitled Chat') return;

    const userMessages = messages.filter(m => m.role === 'user');

    if (userMessages.length < 3) return;

    const nameChat = async () => {
      const promptText = userMessages.slice(0, 3).map(m => m.content).join('\n');
      const res = await fetch('/api/chat-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText }),
      });

      const data = await res.json();
      const name = data.name;

      if (name && sessionId) {
        await supabase.from('sessions').update({ title: name }).eq('id', sessionId);
        hasNamedRef.current = true;
      }
    };

    nameChat();
  }, [messages, sessionId, currentTitle]);
} 