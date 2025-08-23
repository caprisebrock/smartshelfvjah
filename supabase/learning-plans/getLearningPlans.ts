import { supabase } from '../../modules/shared/lib/supabaseClient';
import { LearningPlan } from '../../modules/learning-resources/types/learningPlan.types';

export async function getLearningPlans(): Promise<LearningPlan[]> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch learning plans for the current user
    const { data: plans, error: fetchError } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch learning plans: ${fetchError.message}`);
    }

    return plans || [];
  } catch (error) {
    console.error('Error fetching learning plans:', error);
    throw error;
  }
}
