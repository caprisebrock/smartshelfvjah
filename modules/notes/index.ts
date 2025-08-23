// NOTES MODULE INDEX
// This file exports all public APIs for the notes module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as NotesEditor } from './components/NotesEditor'
export { default as NotesList } from './components/NotesList'
export { default as NoteForm } from './components/NoteForm'
export { default as LinkedResourceBadge } from './components/LinkedResourceBadge'
export { default as ResizablePanel } from './components/ResizablePanel'

// ============================================================================
// PAGE EXPORTS
// ============================================================================

// Page exports removed - now in /pages/ directory

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useNotes } from './hooks/useNotes'

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  quickCreateNote,
  debouncedUpdateNote,
  flushNoteUpdates,
  getNoteById,
  updateNoteFast,
  deleteNoteById,
  getOrCreateNoteSession
} from './services/notesService'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Note,
  SessionRow,
  NoteFormData,
  NoteFormProps,
  NoteFormState,
  NotesEditorProps,
  NotesListProps,
  ResizablePanelProps,
  LinkedResourceBadgeProps,
  CreateNoteParams,
  UpdateNoteParams,
  UpdateNoteFastParams,
  DebouncedUpdateParams,
  NoteSessionResult,
  NoteOperationResult,
  EditorState,
  EditorCallbacks,
  LinkedResource,
  ResourceBadgeState,
  PanelResizeState,
  PanelResizeCallbacks,
  NoteFilter,
  NoteSort,
  NoteSearchResult,
  DatabaseNote,
  DatabaseNoteSession,
  UseNotesReturn,
  UseNoteReturn
} from './types/note.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const NotesModule = {
  components: {
    NotesEditor: () => import('./components/NotesEditor'),
    NotesList: () => import('./components/NotesList'),
    NoteForm: () => import('./components/NoteForm'),
    LinkedResourceBadge: () => import('./components/LinkedResourceBadge'),
    ResizablePanel: () => import('./components/ResizablePanel')
  },
  hooks: {
    useNotes: () => import('./hooks/useNotes')
  },
  services: {
    notesService: () => import('./services/notesService')
  },
  types: () => import('./types/note.types')
}

export default NotesModule 