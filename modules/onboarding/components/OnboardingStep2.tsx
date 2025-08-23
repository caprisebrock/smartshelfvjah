// COPY THIS ENTIRE FILE FROM: pages/onboarding/step2.tsx 
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useUser } from '../../auth/hooks/useUser'
import { supabase } from '../../database/config/databaseConfig'
import { 
  Target, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const FOCUS_OPTIONS = [
  { id: 'learning', label: 'Learning & Education', emoji: '📚', description: 'Build knowledge and skills' },
  { id: 'health', label: 'Health & Fitness', emoji: '💪', description: 'Physical and mental wellness' },
  { id: 'productivity', label: 'Productivity', emoji: '🚀', description: 'Get more done efficiently' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘', description: 'Inner peace and awareness' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨', description: 'Express and create' },
  { id: 'relationships', label: 'Relationships', emoji: '💕', description: 'Connect with others' },
  { id: 'career', label: 'Career Growth', emoji: '📈', description: 'Professional development' },
  { id: 'custom', label: 'Something else...', emoji: '✨', description: 'Define your own focus' }
]

export default function OnboardingStep2() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    focus: '',
    customFocus: ''
  })

  // Load existing data if user refreshes
  useEffect(() => {
    if (!user?.id) return
    
    const loadExistingData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('app_users')
          .select('goal_focus')
          .eq('id', user.id)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile:', fetchError)
          return
        }
        
        if (data?.goal_focus) {
          // Check if it's one of our predefined options
          const predefinedOption = FOCUS_OPTIONS.find(option => option.id === data.goal_focus)
          if (predefinedOption) {
            setFormData(prev => ({
              ...prev,
              focus: data.goal_focus
            }))
          } else {
            // It's a custom focus
            setFormData(prev => ({
              ...prev,
              focus: 'custom',
              customFocus: data.goal_focus
            }))
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }
    
    loadExistingData()
  }, [user?.id])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const validateForm = () => {
    if (formData.focus === 'custom') {
      return formData.customFocus.trim().length > 0
    }
    return formData.focus.length > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!user?.id) {
      console.error('❌ [OnboardingStep2] User is not authenticated — redirecting to signin')
      setError('You must be signed in to continue. Please sign in.')
      router.push('/signin')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const finalFocus = formData.focus === 'custom' ? formData.customFocus.trim() : formData.focus

      const { error: updateError } = await supabase
        .from('app_users')
        .update({
          goal_focus: finalFocus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Navigate to first habit creation
      router.push('/onboarding/first-habit')
      
    } catch (err: any) {
      console.error('Error saving goal focus:', err)
      setError(err.message || 'Failed to save your goal focus. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/onboarding/step1')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>What&apos;s Your Goal? - SmartShelf</title>
        <meta name="description" content="Tell us about your primary focus to personalize your experience" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* Progress indicator */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Step 2 of 3</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">What&apos;s your main focus?</h1>
              <p className="text-gray-600">This helps us personalize your experience and suggest relevant habits</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Focus Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FOCUS_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`
                      relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-emerald-300 hover:shadow-sm
                      ${formData.focus === option.id 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="focus"
                      value={option.id}
                      checked={formData.focus === option.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, focus: e.target.value }))}
                      className="sr-only"
                      disabled={loading}
                    />
                    
                    <div className="flex items-start gap-3 w-full">
                      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      </div>
                      
                      {formData.focus === option.id && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Focus Input */}
              {formData.focus === 'custom' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us more about your focus *
                  </label>
                  <input
                    type="text"
                    value={formData.customFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, customFocus: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="e.g., Language learning, Financial literacy, Cooking..."
                    disabled={loading}
                    required
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={!validateForm() || loading}
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 text-white py-3 px-8 rounded-xl font-medium hover:from-emerald-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              You can always change this later in your settings
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 