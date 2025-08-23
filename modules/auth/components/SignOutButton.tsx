// COPY THIS ENTIRE FILE FROM: components/SignOutButton.tsx
// Move the complete contents of components/SignOutButton.tsx into this file 
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../database/config/databaseConfig'
import { LogOut, Loader2 } from 'lucide-react'

interface SignOutButtonProps {
  /** Button style variant */
  variant?: 'default' | 'sidebar' | 'minimal'
  /** Additional CSS classes */
  className?: string
  /** Custom button content (overrides default text) */
  children?: React.ReactNode
}

/**
 * Reusable sign-out button component for SmartShelf
 * 
 * Handles user logout with proper error handling and loading states.
 * Works with Pages Router and your current Supabase setup.
 * 
 * @example
 * ```tsx
 * // Default red button
 * <SignOutButton />
 * 
 * // Sidebar style (full width, subtle)
 * <SignOutButton variant="sidebar" />
 * 
 * // Minimal style for dropdowns
 * <SignOutButton variant="minimal">Sign Out</SignOutButton>
 * 
 * // Custom styling
 * <SignOutButton className="my-custom-class" />
 * ```
 */
export default function SignOutButton({ 
  variant = 'default', 
  className = '',
  children 
}: SignOutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('Failed to sign out. Please try again.')
      } else {
        console.log('Successfully signed out')
        // The AuthWrapper and useUser hook will handle the redirect automatically
        // But we can also explicitly redirect for immediate feedback
        router.push('/login')
      }
    } catch (err) {
      console.error('Unexpected logout error:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Different button styles based on variant
  const getButtonClasses = () => {
    const baseClasses = 'flex items-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (variant) {
      case 'sidebar':
        return `${baseClasses} w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700`
      case 'minimal':
        return `${baseClasses} text-sm text-gray-600 hover:text-red-600`
      default:
        return `${baseClasses} px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md`
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoggingOut}
      className={`${getButtonClasses()} ${className}`}
      title="Sign out of your account"
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      {children || (isLoggingOut ? 'Signing out...' : 'Sign Out')}
    </button>
  )
} 