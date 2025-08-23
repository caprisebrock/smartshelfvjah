# Habits Module

## Structure
```
modules/habits/
├── components/
│   ├── HabitCard.tsx
│   ├── HabitGrid.tsx
│   ├── HabitHistory.tsx
│   ├── HabitStats.tsx
│   ├── AddHabitForm.tsx
│   ├── DeleteHabitModal.tsx
│   └── CalendarView.tsx
├── hooks/
│   └── useHabits.ts
├── context/
│   └── HabitsContext.tsx
├── services/
│   └── habitService.ts
├── types/
│   └── habit.types.ts
└── index.ts
```

## Components
- **HabitCard.tsx**: Individual habit display card
- **HabitGrid.tsx**: Grid layout for habits
- **HabitHistory.tsx**: Habit completion history
- **HabitStats.tsx**: Habit statistics display
- **AddHabitForm.tsx**: Form for creating new habits
- **DeleteHabitModal.tsx**: Confirmation modal for deletion
- **CalendarView.tsx**: Calendar view for habit tracking

## Hooks
- **useHabits.ts**: Hook for habits data and operations

## Context
- **HabitsContext.tsx**: React context for habits state

## Services
- **habitService.ts**: Habits business logic and API calls

## Types
- **habit.types.ts**: Habit-related type definitions 