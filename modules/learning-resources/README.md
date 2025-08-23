# Learning Resources Module

## Structure
```
modules/learning-resources/
├── components/
│   ├── BookForm.tsx
│   ├── ResourceCard.tsx
│   └── AddResourceForm.tsx
├── pages/
│   ├── add-resource.tsx
│   ├── my-learning.tsx
│   └── resource/[id].tsx
├── hooks/
│   └── useLearningResources.ts
├── services/
│   ├── resourceService.ts
│   └── addBook.ts
├── types/
│   └── resource.types.ts
└── index.ts
```

## Components
- **BookForm.tsx**: Form for adding/editing books
- **ResourceCard.tsx**: Card display for learning resources
- **AddResourceForm.tsx**: Form for adding new resources

## Pages
- **add-resource.tsx**: Add resource page
- **my-learning.tsx**: My learning page
- **resource/[id].tsx**: Individual resource page

## Hooks
- **useLearningResources.ts**: Hook for learning resources data

## Services
- **resourceService.ts**: Learning resources business logic
- **addBook.ts**: Book addition service

## Types
- **resource.types.ts**: Learning resource type definitions 