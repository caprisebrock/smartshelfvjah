# Notes Module

## Structure
```
modules/notes/
├── components/
│   ├── NotesEditor.tsx
│   ├── NotesList.tsx
│   ├── NoteForm.tsx
│   ├── LinkedResourceBadge.tsx
│   └── ResizablePanel.tsx
├── hooks/
│   └── useNotes.ts
├── services/
│   └── notesService.ts
├── types/
│   └── note.types.ts
└── index.ts
```

## Components
- **NotesEditor.tsx**: Rich text editor for notes
- **NotesList.tsx**: List view of all notes
- **NoteForm.tsx**: Form for creating/editing notes
- **LinkedResourceBadge.tsx**: Badge showing linked resources
- **ResizablePanel.tsx**: Resizable panel component

## Hooks
- **useNotes.ts**: Hook for notes data and operations

## Services
- **notesService.ts**: Notes business logic and API calls

## Types
- **note.types.ts**: Note-related type definitions 