export interface Milestone {
  day: number;
  description: string;
  minutes: number;
}

export interface LearningPlanInput {
  title: string;
  start_date: string;
  duration_days: number;
  daily_minutes: number;
  learning_type: string;
  milestones: Milestone[];
  end_date: string;
  status: string;
}

export interface LearningPlan extends LearningPlanInput {
  id: string;
  created_at: string;
  user_id: string;
}

export interface CreatePlanFormData {
  title: string;
  start_date: string;
  duration_days: number;
  daily_minutes: number;
  learning_type: string;
  intensity: 'low' | 'medium' | 'high';
}
