import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useUser } from '../lib/useUser'
import { supabase } from '../lib/supabaseClient'
import ProfileForm from '../components/ProfileForm'
import { ArrowLeft, User, Mail, Calendar, Target, Crown, Clock, Sparkles, Edit3, CheckCircle2 } from 'lucide-react'

interface UserProfile {
  goal_focus?: string
  is_premium?: boolean
  last_active?: string
  timezone?: string
  marketing_opt_in?: boolean
}

export default function Profile() {
  const { user, loading: authLoading } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [upgradingPremium, setUpgradingPremium] = useState(false)

  // Fetch user profile data from app_users table
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      try {
        const { data, error: profileError } = await supabase
          .from('app_users')
          .select('*') // ⛔ TEMP: fetch all fields to ensure nothing is breaking
          .eq('id', user.id)
          .single()

        console.log('🧪 User ID from auth:', user?.id);
        console.log('🧪 Supabase profile data:', data);
        console.log('🧪 Supabase profile error:', profileError);

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          setError('Failed to load profile data')
        } else {
          setProfile(data || {})
        }
        // ✅ After confirming the query works, revert to this safer form:
        // .select('goal_focus, is_premium, last_active, timezone, marketing_opt_in')
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setProfileLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  // Handle premium upgrade
  const handleUpgradePremium = async () => {
    setUpgradingPremium(true)
    try {
      // Get the current authenticated user using supabase.auth.getUser()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authUser || authError) {
        alert('Authentication error. Please sign in again.')
        return
      }

      console.log('✅ Upgrading premium for user ID:', authUser.id)

      const { error } = await supabase
        .from('app_users')
        .update({ is_premium: true })
        .eq('id', authUser.id)

      if (error) {
        throw new Error(error.message)
      }

      alert("You're premium! 🎉")
      setProfile(prev => prev ? { ...prev, is_premium: true } : null)
    } catch (err) {
      console.error('Premium upgrade error:', err)
      alert('Failed to upgrade to premium. Please try again.')
    } finally {
      setUpgradingPremium(false)
    }
  }

  // Handle profile save
  const handleProfileSave = async () => {
    setIsEditing(false)
    
    try {
      // Get the current authenticated user using supabase.auth.getUser()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authUser || authError) {
        console.error('Auth error during profile save:', authError)
        return
      }

      console.log('✅ Refetching profile for user ID:', authUser.id)

      // Refetch profile data to get updated values
      const { data } = await supabase
        .from('app_users')
        .select('goal_focus, is_premium, last_active, timezone, marketing_opt_in')
        .eq('id', authUser.id)
        .single()
      
      if (data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Failed to refetch profile:', err)
    }
  }

  // Show loading screen if redirecting to auth or user not loaded
  if (authLoading || !user) {
    return (
      <>
        <Head>
          <title>Profile - SmartShelf</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">SmartShelf</h1>
            <p className="text-gray-600">Loading profile...</p>
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format last active helper
  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return formatDate(dateString)
  }

  return (
    <>
      <Head>
        <title>Your Profile - SmartShelf</title>
        <meta name="description" content="View and manage your SmartShelf profile" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account and preferences</p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Content */}
          {profileLoading ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile data...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
              <p className="text-red-600 mb-4">
                {error} &mdash; do you see a row in{' '}
                <code className="px-1 py-0.5 ml-1 bg-gray-100 rounded text-xs">public.app_users</code>?
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : isEditing ? (
            <ProfileForm
              initialUser={user}
              initialProfile={profile}
              onCancel={() => setIsEditing(false)}
              onSave={handleProfileSave}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Information */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                      <p className="text-gray-600 text-sm">Your basic account details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Email Address</div>
                        <div className="text-gray-600">{user.email}</div>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Member Since</div>
                        <div className="text-gray-600">{formatDate(user.created_at)}</div>
                      </div>
                    </div>

                    {/* Last Active */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Clock className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Last Active</div>
                        <div className="text-gray-600">{formatLastActive(profile?.last_active)}</div>
                      </div>
                    </div>

                    {/* Goal Focus */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Target className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Learning Goal</div>
                        <div className="text-gray-600">
                          {profile?.goal_focus || 'No goal set yet'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Premium Status */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      profile?.is_premium ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Crown className={`w-6 h-6 ${
                        profile?.is_premium ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Membership</h3>
                      <p className="text-gray-600 text-sm">Your subscription status</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 border-dashed ${
                    profile?.is_premium 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="text-center">
                      <div className={`text-2xl mb-2 ${
                        profile?.is_premium ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {profile?.is_premium ? '✅' : '❌'}
                      </div>
                      <div className={`font-semibold ${
                        profile?.is_premium ? 'text-yellow-900' : 'text-gray-900'
                      }`}>
                        {profile?.is_premium ? 'Premium Member' : 'Free User'}
                      </div>
                      <div className={`text-sm mt-1 ${
                        profile?.is_premium ? 'text-yellow-700' : 'text-gray-600'
                      }`}>
                        {profile?.is_premium 
                          ? 'Access to all premium features' 
                          : 'Upgrade for unlimited access'
                        }
                      </div>
                    </div>
                  </div>

                  {!profile?.is_premium ? (
                    <button 
                      onClick={handleUpgradePremium}
                      disabled={upgradingPremium}
                      className="w-full mt-4 btn-primary group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {upgradingPremium ? (
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Crown className="w-5 h-5 mr-2" />
                      )}
                      {upgradingPremium ? 'Upgrading...' : 'Upgrade to Premium'}
                      {!upgradingPremium && (
                        <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                      )}
                    </button>
                  ) : (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 text-yellow-800">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Premium Member</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Thank you for supporting SmartShelf!
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="font-medium text-gray-900">Edit Profile</div>
                      <div className="text-sm text-gray-600">Update your information</div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="font-medium text-gray-900">Change Password</div>
                      <div className="text-sm text-gray-600">Update your password</div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="font-medium text-gray-900">Privacy Settings</div>
                      <div className="text-sm text-gray-600">Manage your data preferences</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 