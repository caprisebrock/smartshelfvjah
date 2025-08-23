# ONBOARDING MODULE MAPPING - EXACT FILE PLACEMENT GUIDE

## OVERVIEW
This document maps exactly where each file from the `modules/onboarding/` directory should be placed in the main SmartShelf codebase. The onboarding module is currently duplicated and needs to be consolidated.

## CURRENT STATUS
- **Main codebase**: Has onboarding files in `pages/onboarding/` and `components/` 
- **Module**: Has duplicate files in `modules/onboarding/`
- **Action needed**: Remove module duplicates and ensure main codebase has correct files

## FILE MAPPING - EXACT LOCATIONS

### 1. PAGES (4 files)
**Source**: `modules/onboarding/pages/` → **Destination**: `pages/onboarding/`

#### 1.1 `onboarding.tsx` 
- **FROM**: `modules/onboarding/pages/onboarding.tsx`
- **TO**: `pages/onboarding.tsx` (root level, not in subfolder)
- **Purpose**: Main onboarding entry point that redirects to step1
- **Status**: ✅ Already exists in correct location

#### 1.2 `step1.tsx`
- **FROM**: `modules/onboarding/pages/step1.tsx` 
- **TO**: `pages/onboarding/step1.tsx`
- **Purpose**: First onboarding step - user profile setup
- **Status**: ✅ Already exists in correct location

#### 1.3 `step2.tsx`
- **FROM**: `modules/onboarding/pages/step2.tsx`
- **TO**: `pages/onboarding/step2.tsx`
- **Purpose**: Second onboarding step - goal focus selection
- **Status**: ✅ Already exists in correct location

#### 1.4 `first-habit.tsx`
- **FROM**: `modules/onboarding/pages/first-habit.tsx`
- **TO**: `pages/onboarding/first-habit.tsx`
- **Purpose**: Third onboarding step - create first habit
- **Status**: ✅ Already exists in correct location

### 2. COMPONENTS (3 files)
**Source**: `modules/onboarding/components/` → **Destination**: `components/`

#### 2.1 `OnboardingStep1.tsx`
- **FROM**: `modules/onboarding/components/OnboardingStep1.tsx`
- **TO**: `components/OnboardingStep1.tsx`
- **Purpose**: Reusable component for step 1 (can be extracted if needed)
- **Status**: ❌ NOT in main components - needs to be moved

#### 2.2 `OnboardingStep2.tsx`
- **FROM**: `modules/onboarding/components/OnboardingStep2.tsx`
- **TO**: `components/OnboardingStep2.tsx`
- **Purpose**: Reusable component for step 2 (can be extracted if needed)
- **Status**: ❌ NOT in main components - needs to be moved

#### 2.3 `FirstHabitForm.tsx`
- **FROM**: `modules/onboarding/components/FirstHabitForm.tsx`
- **TO**: `components/FirstHabitForm.tsx`
- **Purpose**: Reusable component for first habit creation
- **Status**: ❌ NOT in main components - needs to be moved

### 3. HOOKS (1 file)
**Source**: `modules/onboarding/hooks/` → **Destination**: `lib/`

#### 3.1 `useOnboardingGuard.ts`
- **FROM**: `modules/onboarding/hooks/useOnboardingGuard.ts`
- **TO**: `lib/useOnboardingGuard.ts`
- **Purpose**: Hook to protect onboarding routes and check completion status
- **Status**: ✅ Already exists in correct location

### 4. TYPES (1 file)
**Source**: `modules/onboarding/types/` → **Destination**: `lib/` or create new types file

#### 4.1 `onboarding.types.ts`
- **FROM**: `modules/onboarding/types/onboarding.types.ts`
- **TO**: `lib/onboarding.types.ts` (new file)
- **Purpose**: TypeScript types for onboarding data
- **Status**: ❌ NOT in main lib - needs to be created

### 5. SERVICES (0 files)
**Source**: `modules/onboarding/services/` → **Destination**: N/A
- **Status**: Empty directory - no files to move

### 6. INDEX FILES
**Source**: `modules/onboarding/index.ts` → **Destination**: N/A
- **Status**: Module index file - not needed in main codebase

## EXECUTION ORDER - FIRST 4 FILES

### Phase 1: Move Core Components (4 files)
1. **`OnboardingStep1.tsx`** → `components/OnboardingStep1.tsx`
2. **`OnboardingStep2.tsx`** → `components/OnboardingStep2.tsx`  
3. **`FirstHabitForm.tsx`** → `components/FirstHabitForm.tsx`
4. **`onboarding.types.ts`** → `lib/onboarding.types.ts`

### Phase 2: Cleanup (after first 4)
- Remove `modules/onboarding/` directory entirely
- Verify all imports work correctly
- Test onboarding flow end-to-end

## IMPORT PATH UPDATES NEEDED

After moving files, these import paths will need updating:

### In `pages/onboarding/step1.tsx`:
```typescript
// OLD (if using component):
import OnboardingStep1 from '../../components/OnboardingStep1'

// NEW (if extracting to component):
import OnboardingStep1 from '../../components/OnboardingStep1'
```

### In `pages/onboarding/step2.tsx`:
```typescript
// OLD (if using component):
import OnboardingStep2 from '../../components/OnboardingStep2'

// NEW (if extracting to component):
import OnboardingStep2 from '../../components/OnboardingStep2'
```

### In `pages/onboarding/first-habit.tsx`:
```typescript
// OLD (if using component):
import FirstHabitForm from '../../components/FirstHabitForm'

// NEW (if extracting to component):
import FirstHabitForm from '../../components/FirstHabitForm'
```

## VERIFICATION CHECKLIST

After moving the first 4 files:
- [ ] All 4 files are in correct locations
- [ ] Import paths are updated correctly
- [ ] No TypeScript errors
- [ ] Onboarding flow works end-to-end
- [ ] Components render correctly
- [ ] Types are properly imported

## NOTES

- The main codebase already has the correct page structure
- Only the reusable components and types need to be moved
- The `useOnboardingGuard` hook is already in the right place
- This consolidation will eliminate duplication and improve maintainability 