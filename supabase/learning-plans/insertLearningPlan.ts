import { supabase } from '../../modules/shared/lib/supabaseClient';
import { LearningPlanInput } from '../../modules/learning-resources/types/learningPlan.types';

export async function insertLearningPlan(plan: LearningPlanInput): Promise<void> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Insert the learning plan
    const { error: insertError } = await supabase
      .from('learning_plans')
      .insert({
        user_id: user.id,
        title: plan.title,
        start_date: plan.start_date,
        duration_days: plan.duration_days,
        daily_minutes: plan.daily_minutes,
        learning_type: plan.learning_type,
        milestones: plan.milestones,
        end_date: plan.end_date,
        status: plan.status
      });

    if (insertError) {
      throw new Error(`Failed to insert learning plan: ${insertError.message}`);
    }
  } catch (error) {
    console.error('Error inserting learning plan:', error);
    throw error;
  }
}
