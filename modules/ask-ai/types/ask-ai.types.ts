// ============================================================================
// ASK-AI MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Ask-AI module

// ============================================================================
// CORE AI INTERFACES
// ============================================================================

export interface AIRequest {
  prompt: string;
  tone: string;
  model: string;
  context?: string;
  userId?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokens: number;
  timestamp: string;
  requestId: string;
}

// ============================================================================
// TONE AND MODEL INTERFACES
// ============================================================================

export interface ToneOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface ModelOption {
  value: string;
  label: string;
  description: string;
  isPremium: boolean;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface AskAIFormProps {
  initialPrompt?: string;
  onResponse?: (response: AIResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

// ============================================================================
// FORM STATE INTERFACES
// ============================================================================

export interface AskAIFormState {
  prompt: string;
  tone: string;
  model: string;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// API INTERFACES
// ============================================================================

export interface AskAIAPIRequest {
  prompt: string;
  tone: string;
  model: string;
  context?: string;
  userId: string;
}

export interface AskAIAPIResponse {
  success: boolean;
  response?: AIResponse;
  error?: string;
  message?: string;
}

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

export interface AIContext {
  userNotes?: string[];
  learningResources?: string[];
  habitData?: string[];
  sessionHistory?: string[];
}

// ============================================================================
// SETTINGS INTERFACES
// ============================================================================

export interface AISettings {
  enableGPT4: boolean;
  defaultTone: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ToneType = 'Summary' | 'Detailed' | 'Simple' | 'Academic' | 'Creative';
export type ModelType = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-sonnet' | 'claude-3-haiku';

// ============================================================================
// CONSTANTS
// ============================================================================

export const TONE_OPTIONS: ToneOption[] = [
  {
    value: 'Summary',
    label: 'Summary',
    description: 'Concise overview of key points',
    icon: '📝'
  },
  {
    value: 'Detailed',
    label: 'Detailed',
    description: 'Comprehensive explanation with examples',
    icon: '🔍'
  },
  {
    value: 'Simple',
    label: 'Simple',
    description: 'Easy-to-understand language',
    icon: '💡'
  },
  {
    value: 'Academic',
    label: 'Academic',
    description: 'Formal, scholarly approach',
    icon: '🎓'
  },
  {
    value: 'Creative',
    label: 'Creative',
    description: 'Imaginative and engaging',
    icon: '✨'
  }
];

export const MODEL_OPTIONS: ModelOption[] = [
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    description: 'Fast and efficient',
    isPremium: false
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'Most advanced model',
    isPremium: true
  }
]; 