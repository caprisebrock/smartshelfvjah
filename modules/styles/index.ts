// STYLES MODULE INDEX
// This file exports all public APIs for the styles module

// ============================================================================
// THEME EXPORTS
// ============================================================================

export { ThemeProvider, useTheme } from './themes/themeConfig'

// ============================================================================
// NOTE
// ============================================================================

// CSS files are imported in the main app, not here
// ThemeSwitcher component and detailed types will be added when implemented
// For now, we export the basic theme functionality that exists

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const StylesModule = {
  themes: {
    ThemeProvider: () => import('./themes/themeConfig'),
    useTheme: () => import('./themes/themeConfig')
  }
}

export default StylesModule 