# Onboarding Module

## Structure
```
modules/onboarding/
├── components/
│   └── OnboardingFlow.tsx
├── pages/
│   ├── step1.tsx
│   ├── step2.tsx
│   └── first-habit.tsx
├── hooks/
│   └── useOnboardingGuard.ts
├── services/
│   └── onboardingService.ts
├── types/
│   └── onboarding.types.ts
└── index.ts
```

## Components
- **OnboardingFlow.tsx**: Main onboarding flow component

## Pages
- **step1.tsx**: First onboarding step
- **step2.tsx**: Second onboarding step
- **first-habit.tsx**: First habit creation step

## Hooks
- **useOnboardingGuard.ts**: Hook for protecting onboarding flow

## Services
- **onboardingService.ts**: Onboarding business logic

## Types
- **onboarding.types.ts**: Onboarding type definitions 