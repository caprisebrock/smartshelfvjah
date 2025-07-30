-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'complete' CHECK (status IN ('complete', 'incomplete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one completion record per habit per user per date
  CONSTRAINT unique_user_habit_date UNIQUE(user_id, habit_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_user_date 
ON habit_completions(habit_id, user_id, date);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date 
ON habit_completions(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own habit completions" ON habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit completions" ON habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit completions" ON habit_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit completions" ON habit_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_habit_completions_updated_at 
  BEFORE UPDATE ON habit_completions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 