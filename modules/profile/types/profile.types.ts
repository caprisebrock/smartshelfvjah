// ============================================================================
// PROFILE MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Profile module

// ============================================================================
// CORE PROFILE INTERFACES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  emoji: string;
  color: string;
  isPremium: boolean;
  goalFocus: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  name: string;
  emoji: string;
  color: string;
  goalFocus: string;
  timezone: string;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface ProfileFormProps {
  user: UserProfile;
  onSave?: (profile: UserProfile) => void;
  onCancel?: () => void;
  className?: string;
}

export interface ProfilePanelProps {
  user: UserProfile;
  onEdit?: () => void;
  className?: string;
}

// ============================================================================
// FORM STATE INTERFACES
// ============================================================================

export interface ProfileFormState {
  formData: ProfileFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  hasChanges: boolean;
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ProfileValidationErrors {
  name?: string;
  emoji?: string;
  color?: string;
  goalFocus?: string;
  timezone?: string;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface UpdateProfileRequest {
  id: string;
  updates: Partial<ProfileFormData>;
}

export interface UpdateProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
  message?: string;
}

// ============================================================================
// AVATAR INTERFACES
// ============================================================================

export interface AvatarOption {
  emoji: string;
  color: string;
  label: string;
}

export interface ColorOption {
  value: string;
  name: string;
  class: string;
}

// ============================================================================
// GOAL INTERFACES
// ============================================================================

export interface GoalOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ProfileField = keyof ProfileFormData;
export type ProfileError = keyof ProfileValidationErrors;

// ============================================================================
// CONSTANTS
// ============================================================================

export const PRESET_COLORS: ColorOption[] = [
  { name: 'Blue', value: '#2563eb', class: 'bg-blue-600' },
  { name: 'Green', value: '#10b981', class: 'bg-green-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
  { name: 'Yellow', value: '#eab308', class: 'bg-yellow-500' }
];

export const GOAL_OPTIONS: GoalOption[] = [
  { value: 'productivity', label: 'Productivity', description: 'Focus on getting more done', icon: '⚡' },
  { value: 'learning', label: 'Learning', description: 'Expand your knowledge', icon: '📚' },
  { value: 'health', label: 'Health', description: 'Improve physical wellbeing', icon: '💪' },
  { value: 'creativity', label: 'Creativity', description: 'Express your artistic side', icon: '🎨' },
  { value: 'relationships', label: 'Relationships', description: 'Build better connections', icon: '❤️' },
  { value: 'finance', label: 'Finance', description: 'Manage money better', icon: '💰' }
]; 