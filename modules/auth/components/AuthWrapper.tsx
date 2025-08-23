// COPY THIS ENTIRE FILE FROM: components/AuthWrapper.tsx
// Move the complete contents of components/AuthWrapper.tsx into this file 
import React, { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../hooks/useUser'
import { User, Loader2 } from 'lucide-react'

interface AuthWrapperProps {
  children: ReactNode
}

// Loading screen component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
        <User className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">SmartShelf</h1>
      <div className="flex items-center justify-center gap-3 mb-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading your learning dashboard...</p>
      </div>
      <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
)

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useUser()
  const router = useRouter()

  // Public pages that don't require authentication
  const publicPages = [
    '/login', 
    '/signup', 
    '/sign-up', 
    '/auth',
    '/auth/callback', // Supabase auth callback
    '/api/auth/callback' // API auth callback
  ]

  // Check if current page is public
  const isPublicPage = publicPages.includes(router.pathname)

  // Clear any stale session data on app initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if this is a fresh browser session (no sessionStorage)
      const hasSessionData = window.sessionStorage.getItem('supabase.auth.token')
      
      if (!hasSessionData) {
        // Clear any localStorage auth tokens that might persist
        const keys = Object.keys(window.localStorage)
        keys.forEach(key => {
          if (key.includes('supabase') && key.includes('auth')) {
            window.localStorage.removeItem(key)
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    // Don't redirect if we're still loading or on a public page
    if (loading || isPublicPage) return

    // Special handling for auth callback - let it manage its own auth flow
    if (router.pathname === '/auth/callback') return

    // Session state handling:
    // - loading === true: show loading screen (handled above)
    // - user === null: redirect to login
    // - user exists: render the app (handled in return statement)
    
    if (!user) {
      console.log('No authenticated user, redirecting to login')
      router.push('/login')
    }
  }, [user, loading, router, isPublicPage])

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />
  }

  // If user is not authenticated and trying to access protected page, show loading
  // (the useEffect will handle the redirect)
  if (!user && !isPublicPage) {
    return <LoadingScreen />
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  // (but allow debug pages and session clearing pages)
  const authPages = ['/login', '/signup', '/sign-up', '/auth']
  if (user && authPages.includes(router.pathname)) {
    router.push('/')
    return <LoadingScreen />
  }

  // Render the app
  return <>{children}</>
} 