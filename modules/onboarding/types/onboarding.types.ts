// ============================================================================
// ONBOARDING MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Onboarding module

// ============================================================================
// CORE ONBOARDING INTERFACES
// ============================================================================

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isComplete: boolean;
}

export interface UserOnboardingData {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: Date;
  completedAt?: Date;
  firstHabitCreated?: boolean;
  profileCompleted?: boolean;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface OnboardingStepProps {
  step: OnboardingStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
}

export interface FirstHabitFormProps {
  onSubmit: (habitData: any) => void;
  loading?: boolean;
}

export interface OnboardingStep1Props {
  onNext: () => void;
}

export interface OnboardingStep2Props {
  onNext: () => void;
  onPrevious: () => void;
}

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseOnboardingGuardReturn {
  loading: boolean;
  redirecting: boolean;
  error?: string;
}

export interface UseOnboardingReturn {
  currentStep: number;
  progress: OnboardingProgress;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: number) => void;
  resetOnboarding: () => void;
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

export interface OnboardingFormData {
  name?: string;
  email?: string;
  preferences?: Record<string, any>;
  goals?: string[];
  timezone?: string;
}

export interface FirstHabitData {
  name: string;
  emoji: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'specific-days';
  specificDays?: string[];
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface OnboardingAPI {
  updateProgress: (userId: string, progress: Partial<UserOnboardingData>) => Promise<void>;
  getProgress: (userId: string) => Promise<UserOnboardingData | null>;
  completeOnboarding: (userId: string) => Promise<void>;
  resetOnboarding: (userId: string) => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';
export type OnboardingStepType = 'welcome' | 'profile' | 'preferences' | 'first_habit' | 'complete';

export interface OnboardingConfig {
  steps: OnboardingStep[];
  allowSkipping: boolean;
  requireAllSteps: boolean;
  redirectAfterCompletion: string;
}

export interface OnboardingContext {
  progress: OnboardingProgress;
  config: OnboardingConfig;
  updateProgress: (step: number) => void;
  skipStep: (step: number) => void;
}