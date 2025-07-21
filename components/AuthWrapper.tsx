import React, { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../lib/useUser'
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
    '/api/auth/callback' // Supabase auth callback
  ]

  // Check if current page is public
  const isPublicPage = publicPages.includes(router.pathname)

  useEffect(() => {
    // Don't redirect if we're still loading or on a public page
    if (loading || isPublicPage) return

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
  if (user && (router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/sign-up')) {
    router.push('/')
    return <LoadingScreen />
  }

  // Render the app
  return <>{children}</>
} 