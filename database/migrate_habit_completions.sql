-- Migration script to update habit_completions table constraint
-- Run this in your Supabase SQL editor

-- Drop the existing unique constraint if it exists
ALTER TABLE habit_completions 
DROP CONSTRAINT IF EXISTS habit_completions_habit_id_user_id_date_key;

-- Add the new constraint with the correct name and column order
ALTER TABLE habit_completions 
ADD CONSTRAINT unique_user_habit_date UNIQUE(user_id, habit_id, date);

-- Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    kcu.ordinal_position
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_name = 'habit_completions'
  AND tc.constraint_name = 'unique_user_habit_date'
ORDER BY kcu.ordinal_position; 