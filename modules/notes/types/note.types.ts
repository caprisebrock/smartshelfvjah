import { ReactNode } from 'react'

// ============================================================================
// CORE NOTE TYPES
// ============================================================================

export interface Note {
  id: string
  user_id: string
  title: string
  content: any // TipTap/Slate JSON
  linked_resource_id?: string | null
  created_at: string
  updated_at: string
}

export interface SessionRow {
  id: string
  user_id: string
  title: string
  note_id?: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// NOTE FORM TYPES
// ============================================================================

export interface NoteFormData {
  title: string
  content: string
  category: 'business' | 'marketing' | 'leadership' | 'personal-development' | 'other'
  tags: string[]
  bookTitle?: string
  isFavorite: boolean
}

export interface NoteFormProps {
  onSubmit: (note: NoteFormData) => void
  onCancel: () => void
}

export interface NoteFormState {
  title: string
  content: string
  category: 'business' | 'marketing' | 'leadership' | 'personal-development' | 'other'
  tags: string[]
  bookTitle: string
  isFavorite: boolean
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface NotesEditorProps {
  note: Note | null
  onChangeTitle: (title: string) => void
  onChangeContent: (content: any) => void
}

export interface NotesListProps {
  selectedId?: string | null
  onSelect: (id: string) => void
}

export interface ResizablePanelProps {
  left: ReactNode
  right: ReactNode
  storageKey?: string
}

export interface LinkedResourceBadgeProps {
  resourceId?: string | null
}

// ============================================================================
// SERVICE PARAMETER TYPES
// ============================================================================

export interface CreateNoteParams {
  title?: string
  linked_resource_id?: string | null
}

export interface UpdateNoteParams {
  id: string
  title?: string
  content?: any
  linked_resource_id?: string | null
}

export interface UpdateNoteFastParams {
  title?: string
  content?: any
}

export interface DebouncedUpdateParams {
  title?: string
  content?: any
}

// ============================================================================
// SERVICE RESULT TYPES
// ============================================================================

export interface NoteSessionResult {
  id: string
  title: string
  note_id: string
}

export interface NoteOperationResult {
  success: boolean
  error?: string
  data?: Note
}

// ============================================================================
// EDITOR STATE TYPES
// ============================================================================

export interface EditorState {
  localTitle: string
  localContent: string
  saving: boolean
  isDirty: boolean
}

export interface EditorCallbacks {
  onChangeTitle: (title: string) => void
  onChangeContent: (content: any) => void
  onSave?: () => void
}

// ============================================================================
// LINKED RESOURCE TYPES
// ============================================================================

export interface LinkedResource {
  id: string
  type: 'habit' | 'learning_resource'
  title: string
  author?: string
  total_minutes?: number
  minutes_completed?: number
  streak_days?: number
}

export interface ResourceBadgeState {
  open: boolean
  resource: LinkedResource | null
}

// ============================================================================
// PANEL RESIZE TYPES
// ============================================================================

export interface PanelResizeState {
  chatWidth: number
  dragging: boolean
  isCollapsed: boolean
}

export interface PanelResizeCallbacks {
  onResizeStart: () => void
  onResizeMove: (e: MouseEvent) => void
  onResizeEnd: () => void
  onToggleCollapse: () => void
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface NoteFilter {
  query: string
  category?: string
  tags?: string[]
  isFavorite?: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface NoteSort {
  field: 'title' | 'created_at' | 'updated_at' | 'category'
  direction: 'asc' | 'desc'
}

export interface NoteSearchResult {
  notes: Note[]
  total: number
  hasMore: boolean
}

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface DatabaseNote {
  id: string
  user_id: string
  title: string
  content: any
  linked_resource_id?: string | null
  created_at: string
  updated_at: string
}

export interface DatabaseNoteSession {
  id: string
  user_id: string
  title: string
  note_id?: string | null
  token_count: number
  word_count: number
  created_at: string
  updated_at: string
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseNotesReturn {
  notes: Note[]
  loading: boolean
  error: string | null
  createNote: (params: CreateNoteParams) => Promise<Note>
  updateNote: (params: UpdateNoteParams) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  getNoteById: (id: string) => Promise<Note>
  searchNotes: (filter: NoteFilter) => Promise<NoteSearchResult>
}

export interface UseNoteReturn {
  note: Note | null
  loading: boolean
  error: string | null
  updateNote: (updates: Partial<Note>) => Promise<void>
  deleteNote: () => Promise<void>
  saveNote: () => Promise<void>
} 