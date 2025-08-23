// ============================================================================
// CHAT MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the AI-Chat module
// Extracted from the moved files to ensure type safety and consistency

// ============================================================================
// CORE CHAT INTERFACES
// ============================================================================

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  token_count: number;
  word_count: number;
  note_id?: string | null;
  link_type?: 'habit' | 'learning_resource' | 'general' | 'note';
  link_id?: string;
  link_title?: string;
  linked_habit?: string;
  linked_learning_resource?: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  token_count: number;
}

export interface NoteMsg {
  id?: string;             // server id
  client_id: string;       // stable local id
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  pending?: boolean;       // for optimistic messages
  error?: boolean;         // for error states
}

// ============================================================================
// CHAT STATE AND ACTIONS
// ============================================================================

export interface ChatState {
  sessions: Session[];
  currentSession: Session | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
}

export type ChatAction = 
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'SET_CURRENT_SESSION'; payload: Session | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_SESSION_TITLE'; payload: { sessionId: string; title: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean };

export type NoteChatAction =
  | { type: 'UPSERT'; msg: NoteMsg }
  | { type: 'ACK'; client_id: string; server_id: string }
  | { type: 'SET_ALL'; items: NoteMsg[] }
  | { type: 'UPDATE_CONTENT'; client_id: string; content: string }
  | { type: 'REMOVE'; client_id: string };

// ============================================================================
// CHAT CONTEXT INTERFACE
// ============================================================================

export interface ChatContextValue {
  state: ChatState;
  sendMessage: (content: string) => Promise<boolean>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: (linkType?: 'habit' | 'learning_resource' | 'general' | 'note', linkId?: string, linkTitle?: string, noteId?: string) => Promise<void>;
  ensureNoteSession: (noteId: string) => Promise<string | null>;
  generateSessionTitle: (sessionId: string) => Promise<void>;
  setCurrentSessionId: (sessionId: string) => Promise<void>;
  openNoteChat: (noteId: string) => Promise<void>;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface ChatInputProps {
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
  linkDisabled?: boolean;
}

export interface MessageListProps {
  messages: Message[];
  typing?: boolean;
  onInsertToNote?: (text: string) => void;
  bottomRef?: React.RefObject<HTMLDivElement>;
  noteId?: string;
}

export interface ChatDockProps {
  noteId?: string;
  className?: string;
}

export interface AskBotProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface TypingDotsProps {
  // No props needed for this component
}

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseNoteChatReturn {
  messages: NoteMsg[];
  upsert: (msg: NoteMsg) => void;
  ack: (client_id: string, server_id: string) => void;
  setAll: (items: NoteMsg[]) => void;
  updateContent: (client_id: string, content: string) => void;
  remove: (client_id: string) => void;
  draftRef: React.RefObject<{ client_id: string } | null>;
}

export interface UseAutoNameSessionParams {
  messages: Message[];
  sessionId?: string;
  currentTitle?: string;
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface AIResponseResult {
  sessionId?: string;
  aiResponse: string;
}

export interface GetAIResponseParams {
  userMessage: string;
  previousMessages: Message[];
  sessionId?: string;
}

export interface GenerateSessionTitleParams {
  messages: string[];
  includeEmoji?: boolean;
}

export interface GenerateSessionTitleAIParams {
  messages: string[];
  openaiApiKey?: string;
  includeEmoji?: boolean;
}

export interface ChatNoteBridgeResult {
  id: string;
  title: string;
}

export interface SaveMessageParams {
  sessionId: string;
  userId: string;
  sender: 'user' | 'assistant';
  content: string;
  clientId?: string;
}

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

export interface DatabaseSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  token_count: number;
  word_count: number;
  note_id?: string | null;
  link_type?: 'habit' | 'learning_resource' | 'general' | 'note';
  link_id?: string;
  link_title?: string;
  linked_habit?: string;
  linked_learning_resource?: string;
}

export interface DatabaseMessage {
  id: string;
  session_id: string;
  user_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  token_count: number;
  client_id?: string;
}

export interface DatabaseNote {
  id: string;
  title: string;
  content: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LinkType = 'habit' | 'learning_resource' | 'general' | 'note';
export type MessageSender = 'user' | 'assistant';
export type MessageRole = 'user' | 'assistant';

export interface SessionTitleUpdate {
  sessionId: string;
  title: string;
}

export interface ChatError {
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface ChatNameResponse {
  name: string;
}

export interface ChatAPIResponse {
  response: {
    content: string;
  };
}

// ============================================================================
// REACT COMPONENT TYPES
// ============================================================================

export interface ReactNode {
  children?: React.ReactNode;
}

export interface ChatProviderProps {
  children: React.ReactNode;
} 