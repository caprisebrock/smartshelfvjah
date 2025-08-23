// ============================================================================
// STYLES MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Styles module

// ============================================================================
// THEME INTERFACES
// ============================================================================

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// ============================================================================
// THEME CONFIGURATION INTERFACES
// ============================================================================

export interface ThemeConfig {
  name: string;
  colors: ColorScheme;
  fonts: FontScheme;
  spacing: SpacingScheme;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface FontScheme {
  family: string;
  sizes: FontSizes;
  weights: FontWeights;
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeights {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
}

export interface SpacingScheme {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

// ============================================================================
// COMPONENT STYLING INTERFACES
// ============================================================================

export interface ComponentStyles {
  className?: string;
  style?: React.CSSProperties;
  variant?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ResponsiveStyles {
  mobile?: ComponentStyles;
  tablet?: ComponentStyles;
  desktop?: ComponentStyles;
}

// ============================================================================
// ANIMATION INTERFACES
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
}

export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'neutral';
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpacingVariant = keyof SpacingScheme;
export type FontSizeVariant = keyof FontSizes;
export type FontWeightVariant = keyof FontWeights; 