// ============================================================================
// SETTINGS MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Settings module

// ============================================================================
// CORE SETTINGS INTERFACES
// ============================================================================

export interface SmartSettings {
  enableMotivationalQuotes: boolean;
  enableGPT4: boolean;
  enableSmartFocus: boolean;
  storeAIHistory: boolean;
  notifications: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

// ============================================================================
// DATA STATISTICS INTERFACES
// ============================================================================

export interface DataStats {
  aiHistory: number;
  aiNotes: number;
  resources: number;
  sessions: number;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface SettingsFormProps {
  initialSettings?: SmartSettings;
  onSave?: (settings: SmartSettings) => void;
  onReset?: () => void;
}

// ============================================================================
// SETTING CHANGE INTERFACES
// ============================================================================

export interface SettingChangeEvent {
  key: keyof SmartSettings;
  value: any;
}

// ============================================================================
// THEME INTERFACES
// ============================================================================

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'auto';
  isDark: boolean;
}

// ============================================================================
// STORAGE INTERFACES
// ============================================================================

export interface StoredSettings {
  smartSettings: SmartSettings;
  aiHistory: any[];
  aiNotes: any[];
  resources: any[];
  sessionHistory: any[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SettingsKey = keyof SmartSettings;
export type SettingsValue = SmartSettings[SettingsKey];

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_SETTINGS: SmartSettings = {
  enableMotivationalQuotes: true,
  enableGPT4: false,
  enableSmartFocus: true,
  storeAIHistory: true,
  notifications: true,
  autoSave: true,
  compactMode: false,
};

export const DEFAULT_DATA_STATS: DataStats = {
  aiHistory: 0,
  aiNotes: 0,
  resources: 0,
  sessions: 0,
}; 