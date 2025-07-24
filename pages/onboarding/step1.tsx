import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useUser } from '../../lib/useUser'
import { supabase } from '../../lib/supabaseClient'
import EmojiPicker from 'emoji-picker-react'
import { 
  User, 
  Globe, 
  Smile, 
  ArrowRight, 
  Palette,
  AlertCircle
} from 'lucide-react'

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
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
  { name: 'Teal', value: '#14b8a6', class: 'bg-teal-500' },
]

export default function OnboardingStep1() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#6366f1')
  
  const [formData, setFormData] = useState({
    name: '',
    timezone: 'UTC',
    emoji: '👤',
    color: presetColors[0]?.value || '#2563eb'
  })

  // Extract individual variables for compatibility with the save function
  const fullName = formData.name
  const selectedEmoji = formData.emoji
  const selectedColor = formData.color
  const selectedTimezone = formData.timezone
  const selectedGoal = null // will be set in step 2

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setFormData(prev => ({
        ...prev,
        timezone: detectedTimezone || 'UTC'
      }))
    } catch (err) {
      console.error('Error detecting timezone:', err)
    }
  }, [])

  // Load existing data if user refreshes
  useEffect(() => {
    if (!user?.id) return
    
    const loadExistingData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('app_users')
          .select('name, timezone, emoji, color')
          .eq('id', user.id)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile:', fetchError)
          return
        }
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            timezone: data.timezone || prev.timezone,
            emoji: data.emoji || '👤',
            color: data.color || '#2563eb'
          }))
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

  const handleEmojiSelect = (emojiData: any) => {
    setFormData(prev => ({ ...prev, emoji: emojiData.emoji }))
    setShowEmojiPicker(false)
  }

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }))
    setShowColorPicker(false)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    setFormData(prev => ({ ...prev, color }))
  }

  const validateForm = () => {
    return formData.name.trim().length > 0 && 
           formData.emoji && 
           formData.color
  }

  const handleSaveProfile = async () => {
    setLoading(true);

    // 1 Get current auth user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    
    if (authErr) {
      console.error("❌ [OnboardingStep1] Auth error:", authErr);
      alert("Authentication failed. Please sign in again.");
      setLoading(false);
      return;
    }
    
    if (!user?.id) {
      console.error("❌ [OnboardingStep1] User is not authenticated — redirecting to signin");
      alert("You must be signed in to complete onboarding.");
      setLoading(false);
      router.push('/signin');
      return;
    }
    console.log("AUTH USER ID →", user.id);  // ← copy this ID to compare in Supabase UI

    // 2 Check if custom‑table row exists
    const TABLE = "app_users";          // ← change to "app_users" if that's your real table
    const { data: existing, error: selErr } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", user.id)
      .single();

    if (selErr && selErr.code !== "PGRST116") {      // 116 = row not found
      console.error("SELECT ERROR:", selErr);
      alert("DB lookup failed. See console.");
      setLoading(false);
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: fullName,
      emoji: selectedEmoji,
      color: selectedColor,
      timezone: selectedTimezone,
      goal_focus: selectedGoal,
      updated_at: new Date().toISOString(),
      created_at: existing ? existing.created_at : new Date().toISOString(),
    };

    let dbErr = null;
    if (existing) {
      console.log("Row exists → updating");
      ({ error: dbErr } = await supabase.from(TABLE).update(payload).eq("id", user.id));
    } else {
      console.log("Row missing → inserting");
      ({ error: dbErr } = await supabase.from(TABLE).insert(payload));
    }

    if (dbErr) {
      console.error("INSERT/UPDATE ERROR:", dbErr);
      alert("Failed to save profile: " + dbErr.message);
      setLoading(false);
      return;
    }

    alert("✅ Profile saved!");
    router.push("/onboarding/step2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      alert("Please complete all fields.");
      return;
    }
    
    await handleSaveProfile();
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
        <title>Let&apos;s Get to Know You - SmartShelf</title>
        <meta name="description" content="Set up your profile to get started with SmartShelf" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Progress indicator */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Step 1 of 3</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Let&apos;s get to know you</h1>
              <p className="text-gray-600">Tell us a bit about yourself to personalize your experience</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
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
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors appearance-none bg-white"
                    disabled={loading}
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
                  Your Avatar *
                </label>
                
                {/* Avatar Preview */}
                <div className="mb-4 flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200"
                    style={{ backgroundColor: formData.color }}
                  >
                    <span className="text-3xl">{formData.emoji}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Your avatar preview</div>
                    <div>Choose an emoji and color below</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Emoji Picker */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Emoji</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 flex items-center justify-center"
                        disabled={loading}
                      >
                        {formData.emoji ? (
                          <span className="text-2xl">{formData.emoji}</span>
                        ) : (
                          <Smile className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute top-full mt-2 z-50 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 p-4">
                          <EmojiPicker onEmojiClick={handleEmojiSelect} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Color</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors flex items-center justify-center"
                        disabled={loading}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: formData.color }}
                        />
                      </button>
                      
                      {showColorPicker && (
                        <div className="absolute top-full mt-2 z-30 w-64 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl ring-1 ring-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Choose Color</span>
                            <button 
                              type="button" 
                              onClick={() => setShowColorPicker(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                          
                          {/* Preset Colors */}
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            {presetColors.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => handleColorSelect(color.value)}
                                className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                                  formData.color === color.value 
                                    ? 'border-gray-800 scale-110 shadow-lg' 
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          
                          {/* Custom Color */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Custom</label>
                            <input
                              type="color"
                              value={customColor}
                              onChange={(e) => handleCustomColorChange(e.target.value)}
                              className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!validateForm() || loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-indigo-500 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Welcome to SmartShelf - Your Personal Learning Dashboard
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 