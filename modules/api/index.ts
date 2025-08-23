// API MODULE INDEX
// This file exports all public APIs for the API module

// ============================================================================
// AI API EXPORTS
// ============================================================================

export { default as askAPI } from './ai/aiAPI'
export { default as chatAPI } from './ai/chat'
export { default as generateTitleAPI } from './ai/generate-title'
export { default as quizMeAPI } from './ai/quizMe'
export { default as topicSuggestAPI } from './ai/topicSuggest'
export { default as chatNotesAPI } from './ai/chat-notes'
export { default as chatNameAPI } from './ai/chat-name'

// ============================================================================
// RESOURCES API EXPORTS
// ============================================================================

export { default as addBookAPI } from './resources/addBook'

// ============================================================================
// NOTES API EXPORTS
// ============================================================================

export { default as addNoteAPI } from './notes/addNote'

// ============================================================================
// UTILS API EXPORTS
// ============================================================================

export { default as pingAPI } from './utils/ping'
export { default as testAPI } from './utils/test'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const APIModule = {
  ai: {
    ask: () => import('./ai/aiAPI'),
    chat: () => import('./ai/chat'),
    generateTitle: () => import('./ai/generate-title'),
    quizMe: () => import('./ai/quizMe'),
    topicSuggest: () => import('./ai/topicSuggest'),
    chatNotes: () => import('./ai/chat-notes'),
    chatName: () => import('./ai/chat-name')
  },
  resources: {
    addBook: () => import('./resources/addBook')
  },
  notes: {
    addNote: () => import('./notes/addNote')
  },
  utils: {
    ping: () => import('./utils/ping'),
    test: () => import('./utils/test')
  }
}

export default APIModule 