import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useUser } from '../lib/useUser'
import { supabase } from '../lib/supabaseClient'
import { useHabits } from '../lib/HabitsContext'
import EmojiPicker from 'emoji-picker-react'
import { 
  User, 
  Target, 
  Globe, 
  Upload, 
  Smile, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Crown,
  Palette
} from 'lucide-react'

const FOCUS_OPTIONS = [
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'productivity', label: 'Productivity', emoji: '🚀' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { id: 'custom', label: 'Custom...', emoji: '✨' }
]

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' }
]

const presetColors = [
  { name: 'Blue', value: '#2563eb', class: 'bg-blue-600' },
  { name: 'Green', value: '#10b981', class: 'bg-green-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
]

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function OnboardingWizard() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const { dispatch } = useHabits()
  
  // Early loading state
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  // Step 1: Profile basics
  const [profileData, setProfileData] = useState({
    name: '',
    timezone: 'UTC',
    avatarEmoji: '',
    avatarUrl: ''
  })
  
  // Step 2: Goals & Premium
  const [goalData, setGoalData] = useState({
    focus: '',
    customFocus: '',
    isPremium: false
  })
  
  // Step 3: First habit (optional)
  const [habitData, setHabitData] = useState({
    name: '',
    emoji: '',
    color: presetColors[0]?.value || '#2563eb',
    frequency: 'daily' as 'daily' | 'weekly' | 'specific-days' | 'once',
    specificDays: [] as string[]
  })

  // Initialize timezone safely
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setProfileData(prev => ({
        ...prev,
        timezone: detectedTimezone || 'UTC'
      }))
    } catch (err) {
      console.error('Error detecting timezone:', err)
      // Keep default UTC
    }
    setIsInitializing(false)
  }, [])

  // Load existing profile data if user refreshes
  useEffect(() => {
    if (!user?.id || isInitializing) return
    
    const loadExistingProfile = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('app_users')
          .select('name, timezone, avatar_url, goal_focus, is_premium')
          .eq('id', user.id)
          .single()
        
        if (fetchError) {
          console.error('Error fetching profile:', fetchError)
          return
        }
        
        if (data) {
          // Skip completed steps
          if (data.name) {
            setProfileData(prev => ({
              ...prev,
              name: data.name || '',
              timezone: data.timezone || prev.timezone,
              avatarUrl: data.avatar_url || ''
            }))
            if (!data.goal_focus) {
              setCurrentStep(2)
            }
          }
          if (data.goal_focus) {
            setGoalData(prev => ({
              ...prev,
              focus: data.goal_focus || '',
              isPremium: data.is_premium || false
            }))
            setCurrentStep(3)
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load existing profile data')
      }
    }
    
    loadExistingProfile()
  }, [user, isInitializing])

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    if (!user?.id) return null
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Failed to upload avatar')
      return null
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      
      // Validate file size (512KB max)
      if (file.size > 512 * 1024) {
        setError('File size must be less than 512KB')
        return
      }
      
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        setError('Please select a JPG or PNG image')
        return
      }
      
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setProfileData(prev => ({ ...prev, avatarEmoji: '' }))
      setError(null)
    } catch (err) {
      console.error('File handling error:', err)
      setError('Error processing file')
    }
  }

  const validateStep1 = () => {
    return profileData.name.trim().length > 0 && 
           (avatarFile || profileData.avatarEmoji || profileData.avatarUrl)
  }

  const validateStep2 = () => {
    return goalData.focus && (goalData.focus !== 'custom' || goalData.customFocus.trim())
  }

  const handleNext = async () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (currentStep === 1) {
        // Save step 1 data
        let avatarUrl = profileData.avatarUrl
        
        if (avatarFile) {
          avatarUrl = await handleAvatarUpload(avatarFile) || ''
        }
        
        const { error: upsertError } = await supabase
          .from('app_users')
          .upsert({
            id: user?.id,
            name: profileData.name,
            timezone: profileData.timezone,
            avatar_url: avatarUrl || profileData.avatarEmoji
          })
        
        if (upsertError) throw upsertError
        
        setCurrentStep(2)
      } else if (currentStep === 2) {
        // Save step 2 data
        const finalFocus = goalData.focus === 'custom' ? goalData.customFocus : goalData.focus
        
        const { error: updateError } = await supabase
          .from('app_users')
          .update({
            goal_focus: finalFocus,
            is_premium: goalData.isPremium
          })
          .eq('id', user?.id)
        
        if (updateError) throw updateError
        
        setCurrentStep(3)
      }
    } catch (err) {
      console.error('Error saving step:', err)
      setError('Failed to save progress. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Save habit if provided
      if (habitData.name.trim() && dispatch) {
        const newHabit = {
          id: Date.now().toString(),
          user_id: user?.id,
          name: habitData.name,
          emoji: habitData.emoji || '⭐',
          color: habitData.color,
          frequency: habitData.frequency,
          specific_days: habitData.specificDays,
          streak: 0,
          date_created: new Date().toISOString(),
          completions: []
        }
        
        // Save to database
        const { error: insertError } = await supabase
          .from('habits')
          .insert([{
            user_id: user?.id,
            name: habitData.name,
            emoji: habitData.emoji || '⭐',
            color: habitData.color,
            frequency: habitData.frequency,
            specific_days: habitData.specificDays
          }])
        
        if (insertError) {
          console.error('Error saving habit:', insertError)
        } else {
          // Add to local context
          dispatch({ type: 'ADD_HABIT', payload: newHabit })
        }
      }
      
      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      console.error('Error completing onboarding:', err)
      setError('Failed to complete setup. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Early returns for loading and error states
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to continue.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Welcome to SmartShelf - Setup Your Profile</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-red-600 text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to SmartShelf</h1>
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Let&apos;s get to know you</h2>
                  <p className="text-gray-600">Tell us a bit about yourself to personalize your experience</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors appearance-none bg-white"
                    >
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex gap-4">
                    {/* Upload Option */}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 cursor-pointer transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Upload Photo</span>
                      </label>
                    </div>

                    {/* Emoji Option */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors"
                      >
                        <Smile className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Pick Emoji</span>
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute top-full mt-2 z-10">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setProfileData(prev => ({ ...prev, avatarEmoji: emojiData.emoji }))
                              setAvatarFile(null)
                              setAvatarPreview('')
                              setShowEmojiPicker(false)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avatar Preview */}
                  {(avatarPreview || profileData.avatarEmoji) && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{profileData.avatarEmoji}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Looking good! 👍</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What&apos;s your focus?</h2>
                  <p className="text-gray-600">Choose your primary area of interest</p>
                </div>

                {/* Focus Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Primary Focus *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FOCUS_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setGoalData(prev => ({ ...prev, focus: option.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          goalData.focus === option.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.emoji}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Focus Input */}
                {goalData.focus === 'custom' && (
                  <div>
                    <input
                      type="text"
                      value={goalData.customFocus}
                      onChange={(e) => setGoalData(prev => ({ ...prev, customFocus: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Describe your custom focus..."
                    />
                  </div>
                )}

                {/* Premium Toggle */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">SmartShelf Pro</h3>
                        <p className="text-sm text-gray-600">GPT-4 powered insights • $9/month</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={goalData.isPremium}
                        onChange={(e) => setGoalData(prev => ({ ...prev, isPremium: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Add your first habit</h2>
                  <p className="text-gray-600">Start building positive habits (optional)</p>
                </div>

                {/* Habit Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={habitData.name}
                    onChange={(e) => setHabitData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="e.g., Read 20 minutes, Exercise, Meditate..."
                  />
                </div>

                {/* Emoji & Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emoji
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors flex items-center justify-center"
                      >
                        {habitData.emoji ? (
                          <span className="text-2xl">{habitData.emoji}</span>
                        ) : (
                          <Smile className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute top-full mt-2 z-10">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              setHabitData(prev => ({ ...prev, emoji: emojiData.emoji }))
                              setShowEmojiPicker(false)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors flex items-center justify-center"
                      >
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: habitData.color }}
                        />
                      </button>
                      {showColorPicker && (
                        <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-xl p-3 shadow-lg z-10">
                          <div className="grid grid-cols-5 gap-2">
                            {presetColors.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => {
                                  setHabitData(prev => ({ ...prev, color: color.value }))
                                  setShowColorPicker(false)
                                }}
                                className={`w-8 h-8 rounded-full ${color.class} hover:scale-110 transition-transform`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'specific-days', label: 'Specific Days' },
                      { value: 'once', label: 'One Time' }
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => setHabitData(prev => ({ ...prev, frequency: freq.value as any }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          habitData.frequency === freq.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Days */}
                {habitData.frequency === 'specific-days' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Days
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setHabitData(prev => ({
                              ...prev,
                              specificDays: prev.specificDays.includes(day)
                                ? prev.specificDays.filter(d => d !== day)
                                : [...prev.specificDays, day]
                            }))
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            habitData.specificDays.includes(day)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={loading || (currentStep === 1 && !validateStep1()) || (currentStep === 2 && !validateStep2())}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white rounded-xl hover:from-emerald-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleFinish}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white rounded-xl hover:from-emerald-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Finish Setup
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 