# Shared Module

## Structure
```
modules/shared/
├── components/
│   ├── BackButton.tsx
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   ├── ConfirmDeleteModal.tsx
│   ├── MotivationalQuote.tsx
│   └── ProfileForm.tsx
├── hooks/
│   ├── useAutoNameSession.ts
│   ├── useOnboardingGuard.ts
│   ├── useSmartScroll.ts
│   └── useProtectedRoute.ts
├── context/
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── ui/
│   ├── Avatar.tsx
│   └── Button.tsx
├── utils/
│   └── utils.ts
├── types/
│   └── common.types.ts
└── index.ts
```

## Components
- **BackButton.tsx**: Reusable back navigation button
- **Layout.tsx**: Main layout wrapper
- **Sidebar.tsx**: Navigation sidebar
- **Toast.tsx**: Toast notification component
- **ConfirmDeleteModal.tsx**: Reusable delete confirmation
- **MotivationalQuote.tsx**: Motivational quote display
- **ProfileForm.tsx**: Profile editing form

## Hooks
- **useAutoNameSession.ts**: Auto-naming session hook
- **useOnboardingGuard.ts**: Onboarding protection hook
- **useSmartScroll.ts**: Smart scrolling behavior hook
- **useProtectedRoute.ts**: Route protection hook

## Context
- **ThemeContext.tsx**: Theme management context
- **ToastContext.tsx**: Toast notification context

## UI
- **Avatar.tsx**: User avatar component
- **Button.tsx**: Reusable button component

## Utils
- **utils.ts**: Common utility functions

## Types
- **common.types.ts**: Shared type definitions 