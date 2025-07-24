import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import EmojiPicker from 'emoji-picker-react'
import { 
  User, 
  Mail, 
  Target, 
  Globe, 
  Bell, 
  Smile, 
  Palette,
  Save, 
  X, 
  AlertCircle 
} from 'lucide-react'

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

interface ProfileFormProps {
  initialUser: any
  initialProfile: any
  onCancel: () => void
  onSave: () => void
}

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
]

export default function ProfileForm({ initialUser, initialProfile, onCancel, onSave }: ProfileFormProps) {
  // Safely extract avatar data with fallbacks
  const avatarEmoji = initialProfile?.emoji || '❔';
  const avatarColor = initialProfile?.color || '#f3f4f6';

  const [formData, setFormData] = useState({
    name: initialUser?.user_metadata?.name || '',
    goal_focus: initialProfile?.goal_focus || '',
    timezone: initialProfile?.timezone || 'UTC',
    marketing_opt_in: initialProfile?.marketing_opt_in || false,
    emoji: avatarEmoji,
    color: avatarColor,
  })
  
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#6366f1')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }
    
    if (formData.goal_focus.length > 100) {
      newErrors.goal_focus = 'Goal must be 100 characters or less'
    }
    
    if (!formData.emoji) {
      newErrors.emoji = 'Please select an emoji for your avatar'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors before saving.')
      return
    }

    setSaving(true)
    try {
      // Get the current authenticated user using supabase.auth.getUser()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ [ProfileForm] Auth error during save:', authError)
        alert('Authentication error. Please sign in again.')
        setSaving(false)
        return
      }
      
      if (!user) {
        console.error('❌ [ProfileForm] User is not authenticated — cannot save profile')
        alert('You must be signed in to save your profile. Please sign in again.')
        setSaving(false)
        return
      }

      console.log('✅ Saving profile for user ID:', user.id)

      // Update app_users table with correct field names
      const { error: profileError } = await supabase
        .from('app_users')
        .update({
          goal_focus: formData.goal_focus,
          timezone: formData.timezone,
          marketing_opt_in: formData.marketing_opt_in,
          emoji: formData.emoji,
          color: formData.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`)
      }

      // Update Supabase Auth metadata
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          emoji: formData.emoji, // Store emoji in user metadata
        }
      })

      if (authUpdateError) {
        throw new Error(`Auth update failed: ${authUpdateError.message}`)
      }

      alert('Profile updated successfully! 🎉')
      onSave()
    } catch (error) {
      console.error('Save error:', error)
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <p className="text-gray-600">Update your personal information and preferences</p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              <p className="text-gray-600 text-sm">Your basic profile details</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your display name"
                maxLength={100}
              />
              {errors.name && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{initialUser.email}</span>
                <span className="ml-auto text-xs text-gray-500">Cannot be changed</span>
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar *
              </label>
              
              {/* Avatar Preview - Fixed with safe fallbacks */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border"
                  style={{ backgroundColor: formData.color || '#f3f4f6' }}
                >
                  <span className="text-2xl">{formData.emoji || '❔'}</span>
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
                      className={`w-full px-4 py-3 border rounded-xl hover:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 flex items-center justify-center ${
                        errors.emoji ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      {formData.emoji ? (
                        <span className="text-2xl">{formData.emoji}</span>
                      ) : (
                        <Smile className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute top-full mt-2 z-50 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 p-4">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            handleInputChange('emoji', emojiData.emoji)
                            setShowEmojiPicker(false)
                          }}
                        />
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-center"
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: formData.color }}
                      />
                    </button>
                    
                    {showColorPicker && (
                      <div className="absolute top-full mt-2 z-40 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {presetColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => {
                                handleInputChange('color', color.value)
                                setShowColorPicker(false)
                              }}
                              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                formData.color === color.value 
                                  ? 'border-gray-800 scale-110 shadow-lg' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <div className="border-t pt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-2">Custom</label>
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => {
                              setCustomColor(e.target.value)
                              handleInputChange('color', e.target.value)
                            }}
                            className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {errors.emoji && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.emoji}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Preferences</h3>
              <p className="text-gray-600 text-sm">Your learning goals and settings</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Learning Goal */}
            <div>
              <label htmlFor="goal_focus" className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goal
              </label>
              <textarea
                id="goal_focus"
                value={formData.goal_focus}
                onChange={(e) => handleInputChange('goal_focus', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${
                  errors.goal_focus ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="What would you like to learn or achieve?"
                maxLength={100}
              />
              <div className="mt-1 flex justify-between items-center">
                {errors.goal_focus && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.goal_focus}
                  </div>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.goal_focus.length}/100
                </span>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none bg-white"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marketing Opt-in */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    checked={formData.marketing_opt_in}
                    onChange={(e) => handleInputChange('marketing_opt_in', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-focus:ring-2 peer-focus:ring-purple-500 peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-colors">
                    {formData.marketing_opt_in && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Newsletter Subscription</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    I&apos;d like to receive the monthly SmartShelf newsletter with learning tips and updates.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  )
} 