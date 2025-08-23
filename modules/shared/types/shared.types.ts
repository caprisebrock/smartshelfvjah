// ============================================================================
// SHARED MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Shared module
// Extracted from the moved files to ensure type safety and consistency

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface BackButtonProps {
  to?: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export interface SidebarProps {
  // No props needed for this component
}

export interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface MotivationalQuoteProps {
  // No props needed for this component
}

export interface AvatarProps {
  kind: 'user' | 'assistant';
}

// ============================================================================
// CONTEXT INTERFACES
// ============================================================================

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

// ============================================================================
// HOOK INTERFACES
// ============================================================================

export interface UseSmartScrollReturn {
  ref: React.RefObject<HTMLDivElement | null>;
}

export interface UseSmartScrollParams {
  deps: React.DependencyList;
}

// ============================================================================
// UTILITY INTERFACES
// ============================================================================

export interface DebouncedCallbackParams<T extends (...args: any[]) => any> {
  callback: T;
  delay: number;
}

export interface DebouncedCallbackReturn<T extends (...args: any[]) => any> {
  (callback: T, delay: number): T;
}

// ============================================================================
// THEME INTERFACES
// ============================================================================

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  name: Theme;
  label: string;
  icon: string;
}

export interface ThemePreferences {
  savedTheme: Theme;
  systemPreference: 'light' | 'dark';
  currentTheme: Theme;
}

// ============================================================================
// TOAST INTERFACES
// ============================================================================

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastConfig {
  type: ToastType;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoClose?: boolean;
}

// ============================================================================
// NAVIGATION INTERFACES
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSecondary?: boolean;
  badge?: string | number;
}

export interface NavigationConfig {
  mainItems: NavItem[];
  secondaryItems: NavItem[];
  userItems: NavItem[];
}

export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  showSidebar: boolean;
  title: string;
  description?: string;
}

// ============================================================================
// USER PROFILE INTERFACES
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  emoji: string;
  color: string;
  email?: string;
  avatar?: string;
}

export interface ProfileLoadingState {
  loading: boolean;
  error: string | null;
  data: UserProfile | null;
}

// ============================================================================
// SIDEBAR INTERFACES
// ============================================================================

export interface SidebarState {
  isCollapsed: boolean;
  activeSection: string;
  showUserMenu: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: NavItem[];
  isCollapsible?: boolean;
  isExpanded?: boolean;
}

// ============================================================================
// MODAL INTERFACES
// ============================================================================

export interface ModalState {
  isOpen: boolean;
  type: 'delete' | 'confirm' | 'info' | 'form';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ModalConfig {
  backdrop: boolean;
  closeOnEscape: boolean;
  closeOnClickOutside: boolean;
  animation: 'fade' | 'slide' | 'scale';
}

// ============================================================================
// ANIMATION INTERFACES
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface TransitionState {
  entering: boolean;
  entered: boolean;
  exiting: boolean;
  exited: boolean;
}

// ============================================================================
// COLOR AND STYLING INTERFACES
// ============================================================================

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ColorVariants {
  light: ColorScheme;
  dark: ColorScheme;
}

export interface StyleConfig {
  borderRadius: string;
  shadow: string;
  transition: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
}

// ============================================================================
// RESPONSIVE INTERFACES
// ============================================================================

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
}

export interface ResponsiveConfig {
  breakpoints: Breakpoint[];
  containerMaxWidths: Record<string, string>;
  spacing: Record<string, string>;
}

// ============================================================================
// ACCESSIBILITY INTERFACES
// ============================================================================

export interface AccessibilityConfig {
  skipToContent: boolean;
  focusVisible: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface AriaProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: string;
}

// ============================================================================
// ERROR HANDLING INTERFACES
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorConfig {
  showStackTrace: boolean;
  logToConsole: boolean;
  fallbackUI: React.ComponentType<{ error: Error }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const THEME_OPTIONS: Theme[] = ['light', 'dark', 'auto'];

export const TOAST_TYPES: ToastType[] = ['success', 'error', 'info'];

export const BACK_BUTTON_VARIANTS: BackButtonProps['variant'][] = ['default', 'ghost', 'outline'];

export const AVATAR_KINDS: AvatarProps['kind'][] = ['user', 'assistant'];

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ReactNode = React.ReactNode;
export type ComponentType<P = {}> = React.ComponentType<P>;
export type RefObject<T> = React.RefObject<T>;
export type DependencyList = React.DependencyList;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EventHandler<T = Event> = (event: T) => void;
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;
export type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void; 