import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useUser } from '../modules/auth/hooks/useUser'

export default function OnboardingWizard() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  // Redirect to the new step-based onboarding
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/onboarding/step1')
    } else if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Starting Onboarding - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Redirecting to Onboarding - SmartShelf</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to onboarding...</p>
        </div>
      </div>
    </>
  )
} 