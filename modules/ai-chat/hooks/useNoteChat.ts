// COPY THIS ENTIRE FILE FROM: lib/useNoteChat.ts
// Move the complete contents of lib/useNoteChat.ts into this file 
import { useReducer, useRef } from 'react';

export type NoteMsg = {
  id?: string;             // server id
  client_id: string;       // stable local id
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  pending?: boolean;       // for optimistic messages
  error?: boolean;         // for error states
};

type Action =
  | { type: 'UPSERT'; msg: NoteMsg }
  | { type: 'ACK'; client_id: string; server_id: string }
  | { type: 'SET_ALL'; items: NoteMsg[] }
  | { type: 'UPDATE_CONTENT'; client_id: string; content: string }
  | { type: 'REMOVE'; client_id: string };

function reducer(state: NoteMsg[], a: Action): NoteMsg[] {
  switch (a.type) {
    case 'SET_ALL': 
      return a.items;
      
    case 'UPSERT': {
      const i = state.findIndex(m => m.client_id === a.msg.client_id || (a.msg.id && m.id === a.msg.id));
      if (i === -1) return [...state, a.msg];
      const copy = state.slice(); 
      copy[i] = { ...state[i], ...a.msg }; 
      return copy;
    }
    
    case 'ACK': {
      const i = state.findIndex(m => m.client_id === a.client_id);
      if (i === -1) return state;
      const copy = state.slice(); 
      copy[i] = { ...copy[i], id: a.server_id, pending: false }; 
      return copy;
    }
    
    case 'UPDATE_CONTENT': {
      const i = state.findIndex(m => m.client_id === a.client_id);
      if (i === -1) return state;
      const copy = state.slice(); 
      copy[i] = { ...copy[i], content: a.content }; 
      return copy;
    }
    
    case 'REMOVE': {
      return state.filter(m => m.client_id !== a.client_id);
    }
    
    default:
      return state;
  }
}

export function useNoteChat(initial: NoteMsg[] = []) {
  const [messages, dispatch] = useReducer(reducer, initial);
  const draftRef = useRef<{ client_id: string } | null>(null);

  const upsert = (msg: NoteMsg) => dispatch({ type: 'UPSERT', msg });
  const ack = (client_id: string, id: string) => dispatch({ type: 'ACK', client_id, server_id: id });
  const setAll = (items: NoteMsg[]) => dispatch({ type: 'SET_ALL', items });
  const updateContent = (client_id: string, content: string) => dispatch({ type: 'UPDATE_CONTENT', client_id, content });
  const remove = (client_id: string) => dispatch({ type: 'REMOVE', client_id });

  return { 
    messages, 
    upsert, 
    ack, 
    setAll, 
    updateContent,
    remove,
    draftRef 
  };
} 