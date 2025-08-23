// SHARED MODULE INDEX
// This file exports all public APIs for the shared module

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as BackButton } from './components/BackButton'
export { default as Layout } from './components/Layout'
export { default as Sidebar } from './components/Sidebar'
export { default as ToastComponent } from './components/Toast'
export { default as ConfirmDeleteModal } from './components/ConfirmDeleteModal'
export { default as MotivationalQuote } from './components/MotivationalQuote'
export { default as Avatar } from './components/ui/Avatar'

// ============================================================================
// CONTEXT EXPORTS
// ============================================================================

export { ThemeProvider, useTheme } from './context/ThemeContext'
export { ToastProvider, useToast } from './context/ToastContext'

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useSmartScroll } from './hooks/useSmartScroll'

// ============================================================================
// LIB EXPORTS
// ============================================================================

export { supabase } from './lib/supabaseClient'
export { useDebouncedCallback } from './lib/utils'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Component Props
  BackButtonProps,
  LayoutProps,
  SidebarProps,
  ToastItemProps,
  ConfirmDeleteModalProps,
  MotivationalQuoteProps,
  AvatarProps,
  
  // Context Interfaces
  ThemeContextType,
  ToastContextType,
  
  // Hook Interfaces
  UseSmartScrollReturn,
  UseSmartScrollParams,
  
  // Utility Interfaces
  DebouncedCallbackParams,
  DebouncedCallbackReturn,
  
  // Theme Interfaces
  Theme,
  ThemeConfig,
  ThemePreferences,
  
  // Toast Interfaces
  Toast,
  ToastType,
  ToastConfig,
  ToastOptions,
  
  // Navigation Interfaces
  NavItem,
  NavigationConfig,
  RouteConfig,
  
  // User Profile Interfaces
  UserProfile,
  ProfileLoadingState,
  
  // Sidebar Interfaces
  SidebarState,
  SidebarSection,
  
  // Modal Interfaces
  ModalState,
  ModalConfig,
  
  // Animation Interfaces
  AnimationConfig,
  TransitionState,
  
  // Color and Styling Interfaces
  ColorScheme,
  ColorVariants,
  StyleConfig,
  
  // Responsive Interfaces
  Breakpoint,
  ResponsiveConfig,
  
  // Accessibility Interfaces
  AccessibilityConfig,
  AriaProps,
  
  // Error Handling Interfaces
  ErrorBoundaryState,
  ErrorConfig,
  
  // Utility Types
  ReactNode,
  ComponentType,
  RefObject,
  DependencyList,
  Optional,
  RequiredFields,
  DeepPartial,
  EventHandler,
  AsyncFunction,
  DebouncedFunction
} from './types/shared.types'

// ============================================================================
// CONSTANT EXPORTS
// ============================================================================

export {
  THEME_OPTIONS,
  TOAST_TYPES,
  BACK_BUTTON_VARIANTS,
  AVATAR_KINDS
} from './types/shared.types'

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const SharedModule = {
  components: {
    BackButton: () => import('./components/BackButton'),
    Layout: () => import('./components/Layout'),
    Sidebar: () => import('./components/Sidebar'),
    ToastComponent: () => import('./components/Toast'),
    ConfirmDeleteModal: () => import('./components/ConfirmDeleteModal'),
    MotivationalQuote: () => import('./components/MotivationalQuote'),
    Avatar: () => import('./components/ui/Avatar')
  },
  context: {
    ThemeProvider: () => import('./context/ThemeContext'),
    ToastProvider: () => import('./context/ToastContext')
  },
  hooks: {
    useTheme: () => import('./context/ThemeContext'),
    useToast: () => import('./context/ToastContext'),
    useSmartScroll: () => import('./hooks/useSmartScroll')
  },
  lib: {
    supabaseClient: () => import('./lib/supabaseClient'),
    utils: () => import('./lib/utils')
  },
  types: () => import('./types/shared.types')
}

export default SharedModule 