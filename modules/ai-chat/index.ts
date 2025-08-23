// AI-CHAT MODULE INDEX
// This file exports all public APIs for the ai-chat module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as ChatInput } from './components/ChatInput'
export { default as MessageList } from './components/MessageList'
export { default as ChatDock } from './components/ChatDock'
export { default as AskBot } from './components/AskBot'
export { default as TypingDots } from './components/ui/TypingDots'

// ============================================================================
// PAGE EXPORTS - REMOVED  
// ============================================================================
// Pages are now in /pages/ directory for Next.js routing

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useNoteChat } from './hooks/useNoteChat'
export { useAutoNameSession } from './hooks/useAutoNameSession'

// ============================================================================
// CONTEXT EXPORTS
// ============================================================================

export { ChatProvider, useChat } from './context/ChatContext'

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { getAIResponse, createSessionOnly } from './services/getAIResponse'
export { generateSessionTitle, generateSessionTitleWithAI } from './services/generateSessionTitle'
export { getOrCreateNoteSession, getSessionMessages } from './services/chatNoteBridge'
export { saveMessageToSupabase } from './services/saveMessageToSupabase'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core Chat Interfaces
  Session,
  Message,
  NoteMsg,
  
  // State Management
  ChatState,
  ChatAction,
  NoteChatAction,
  
  // Context Interface
  ChatContextValue,
  
  // Component Props
  ChatInputProps,
  MessageListProps,
  ChatDockProps,
  AskBotProps,
  TypingDotsProps,
  
  // Hook Interfaces
  UseNoteChatReturn,
  UseAutoNameSessionParams,
  
  // Service Interfaces
  AIResponseResult,
  GetAIResponseParams,
  GenerateSessionTitleParams,
  GenerateSessionTitleAIParams,
  ChatNoteBridgeResult,
  SaveMessageParams,
  
  // Database Interfaces
  DatabaseSession,
  DatabaseMessage,
  DatabaseNote,
  
  // Utility Types
  LinkType,
  MessageSender,
  MessageRole,
  SessionTitleUpdate,
  ChatError,
  
  // API Response Interfaces
  ChatNameResponse,
  ChatAPIResponse,
  
  // React Component Types
  ReactNode,
  ChatProviderProps
} from './types/chat.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const AIChatModule = {
  components: {
    ChatInput: () => import('./components/ChatInput'),
    MessageList: () => import('./components/MessageList'),
    ChatDock: () => import('./components/ChatDock'),
    AskBot: () => import('./components/AskBot'),
    TypingDots: () => import('./components/ui/TypingDots')
  },
  pages: {
    // AIChatPage removed - now in /pages/aichat.tsx
  },
  hooks: {
    useNoteChat: () => import('./hooks/useNoteChat'),
    useAutoNameSession: () => import('./hooks/useAutoNameSession')
  },
  context: {
    ChatProvider: () => import('./context/ChatContext'),
    useChat: () => import('./context/ChatContext')
  },
  services: {
    getAIResponse: () => import('./services/getAIResponse'),
    generateSessionTitle: () => import('./services/generateSessionTitle'),
    chatNoteBridge: () => import('./services/chatNoteBridge'),
    saveMessageToSupabase: () => import('./services/saveMessageToSupabase')
  },
  types: () => import('./types/chat.types')
}

export default AIChatModule 