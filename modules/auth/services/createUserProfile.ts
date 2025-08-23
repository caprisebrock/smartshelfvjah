// COPY THIS ENTIRE FILE FROM: lib/createUserProfile.ts
// Move the complete contents of lib/createUserProfile.ts into this file 
import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Creates a user profile in app_users table if it doesn't exist.
 * Returns { success: true } if profile exists or is created successfully.
 * Returns { success: false, error } if creation fails.
 */
export async function createUserProfile (
  supabase: SupabaseClient,
  user: User | null
) {
  if (!user) {
    console.error('❌ createUserProfile called with `null` user')
    return { success: false, error: new Error('User is null') }
  }

  try {
    // First, check if profile already exists
    console.log('🔍 Checking if profile exists for user:', user.id)
    const { data: existingProfile, error: checkError } = await supabase
      .from('app_users')
      .select('id, goal_focus')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // Real error (not "not found")
      console.error('❌ Error checking existing profile:', checkError.message)
      return { success: false, error: checkError }
    }

    if (existingProfile) {
      console.log('✅ Profile already exists for user:', user.id)
      return { success: true, isExisting: true, profile: existingProfile }
    }

    // Profile doesn't exist, create it
    console.log('🆕 Creating new profile for user:', user.id)
    const payload = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      emoji: '👤', // Default emoji
      color: '#6b7280', // Default gray color
      is_premium: false,
      goal_focus: '', // Empty - user needs to complete onboarding
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('👉 Inserting new user profile:', payload)

    const { data, error: insertError } = await supabase
      .from('app_users')
      .insert(payload)
      .select('id, goal_focus')
      .single()

    if (insertError) {
      console.error('❌ Failed to create user profile:', insertError.message)
      return { success: false, error: insertError }
    }

    console.log('✅ New user profile created:', data)
    return { success: true, isExisting: false, profile: data }

  } catch (err) {
    console.error('❌ Unexpected error in createUserProfile:', err)
    return { success: false, error: err instanceof Error ? err : new Error('Unknown error') }
  }
} 