import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from './useUser'
import { supabase } from './supabaseClient'

export function useOnboardingGuard() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (loading || !user) return

      // Skip check for auth pages and onboarding itself
      const authPages = ['/login', '/signup', '/sign-up', '/onboarding', '/onboarding/step1', '/onboarding/step2', '/onboarding/first-habit', '/auth']
      if (authPages.includes(router.pathname)) return

      try {
        const { data, error } = await supabase
          .from('app_users')
          .select('name, goal_focus')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error checking onboarding status:', error)
          return
        }

        // If profile is incomplete, redirect to onboarding
        if (!data?.name || !data?.goal_focus) {
          console.log('Profile incomplete, redirecting to onboarding')
          router.push('/onboarding/step1')
        }
      } catch (error) {
        console.error('Unexpected error in onboarding guard:', error)
      }
    }

    checkOnboardingStatus()
  }, [user, loading, router])

  return { user, loading }
} 