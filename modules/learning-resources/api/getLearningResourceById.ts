import { supabase } from '../../database/config/databaseConfig';

export interface LearningResource {
  id: string;
  user_id: string;
  emoji: string;
  type: string;
  title: string;
  author?: string;
  duration_minutes: number;
  progress_minutes: number;
  category_tags: string[];
  reminder_date?: string;
  reflection?: string;
  created_at: string;
  updated_at?: string;
}

export async function getLearningResourceById(id: string, userId: string): Promise<LearningResource | null> {
  try {
    const { data, error } = await supabase
      .from('learning_resources')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching learning resource:', error);
      return null;
    }

    return data as LearningResource;
  } catch (err) {
    console.error('Error fetching learning resource:', err);
    return null;
  }
}

export async function deleteLearningResource(id: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('learning_resources')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting learning resource:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting learning resource:', err);
    return false;
  }
}
