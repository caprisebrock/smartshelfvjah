import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  User, 
  Mail, 
  Target, 
  Globe, 
  Bell, 
  Camera, 
  Save, 
  X, 
  AlertCircle 
} from 'lucide-react'

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
  const [formData, setFormData] = useState({
    name: initialUser?.user_metadata?.name || '',
    goal_focus: initialProfile?.goal_focus || '',
    timezone: initialProfile?.timezone || 'UTC',
    marketing_opt_in: initialProfile?.marketing_opt_in || false,
    avatar_url: initialUser?.user_metadata?.avatar_url || '',
  })
  
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    
    if (formData.avatar_url && formData.avatar_url.length > 500) {
      newErrors.avatar_url = 'Avatar URL must be 500 characters or less'
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
      // Update app_users table
      const { error: profileError } = await supabase
        .from('app_users')
        .update({
          goal_focus: formData.goal_focus,
          timezone: formData.timezone,
          marketing_opt_in: formData.marketing_opt_in,
        })
        .eq('id', initialUser.id)

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`)
      }

      // Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          avatar_url: formData.avatar_url,
        }
      })

      if (authError) {
        throw new Error(`Auth update failed: ${authError.message}`)
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

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Camera className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.avatar_url ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/avatar.jpg"
                  maxLength={500}
                />
              </div>
              {errors.avatar_url && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.avatar_url}
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