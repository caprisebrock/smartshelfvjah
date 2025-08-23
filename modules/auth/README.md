# Auth Module

## Structure
```
modules/auth/
├── components/
│   ├── AuthWrapper.tsx
│   ├── GoogleSignInButton.tsx
│   ├── SignOutButton.tsx
│   └── UserMenu.tsx
├── pages/
│   ├── auth.tsx
│   ├── login.tsx
│   ├── signin.tsx
│   ├── signup.tsx
│   └── sign-up.tsx
├── hooks/
│   ├── useUser.ts
│   └── useProtectedRoute.ts
├── services/
│   ├── authService.ts
│   ├── createUserProfile.ts
│   └── ensurePublicUser.ts
├── types/
│   └── auth.types.ts
└── index.ts
```

## Components
- **AuthWrapper.tsx**: Wraps app with authentication context
- **GoogleSignInButton.tsx**: Google OAuth sign-in button
- **SignOutButton.tsx**: Sign out functionality
- **UserMenu.tsx**: User dropdown menu

## Pages
- **auth.tsx**: Main auth page
- **login.tsx**: Login page
- **signin.tsx**: Sign in page
- **signup.tsx**: Sign up page
- **sign-up.tsx**: Alternative sign up page

## Hooks
- **useUser.ts**: Hook for accessing user data
- **useProtectedRoute.ts**: Hook for protecting routes

## Services
- **authService.ts**: Authentication business logic
- **createUserProfile.ts**: User profile creation
- **ensurePublicUser.ts**: Public user creation

## Types
- **auth.types.ts**: Authentication type definitions 