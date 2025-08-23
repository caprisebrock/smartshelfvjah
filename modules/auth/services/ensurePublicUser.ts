// COPY THIS ENTIRE FILE FROM: lib/ensurePublicUser.ts
// Move the complete contents of lib/ensurePublicUser.ts into this file 
import { supabase } from '../../database/config/databaseConfig'

/**
 * Ensures a row exists in the public.users table for the authenticated user
 * This is required because learning_resources.user_id references public.users.id
 * 
 * @param userData Optional user data to include when creating the row
 * @returns Promise<boolean> - true if row exists or was created successfully
 */
export async function ensurePublicUser(userData?: {
  name?: string
  emoji?: string
  color?: string
  goal_focus?: string
}): Promise<boolean> {
  try {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      console.error('Auth error in ensurePublicUser:', authError)
      return false
    }

    console.log('✅ Checking public.users for user ID:', user.id)

    // Check if a row exists in public.users table
    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking public.users:', selectError)
      return false
    }

    // If no row exists in public.users, create one
    if (!existing) {
      console.log('Creating new row in public.users table for user:', user.id)
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: userData?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          emoji: userData?.emoji || '👤',
          color: userData?.color || '#2563eb',
          goal_focus: userData?.goal_focus || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating public.users row:', insertError)
        return false
      }

      console.log('✅ Successfully created public.users row for user:', user.id)
    } else {
      console.log('✅ public.users row already exists for user:', user.id)
    }

    return true
  } catch (err) {
    console.error('Unexpected error in ensurePublicUser:', err)
    return false
  }
} 