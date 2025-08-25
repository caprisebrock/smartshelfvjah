-- Add habit linking support to notes table
-- This allows notes to be linked to either learning resources or habits

-- Add linked_habit_id column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS linked_habit_id UUID;

-- Add index for better performance on habit-linked notes
CREATE INDEX IF NOT EXISTS idx_notes_linked_habit ON notes(linked_habit_id) WHERE linked_habit_id IS NOT NULL;

-- Add foreign key constraint if habits table exists (optional, but recommended)
-- Uncomment the line below if you want to enforce referential integrity
-- ALTER TABLE notes ADD CONSTRAINT fk_notes_habit FOREIGN KEY (linked_habit_id) REFERENCES habits(id) ON DELETE SET NULL;

-- Update RLS policies to handle the new column (they should already work since they're based on user_id)

-- Add tags column for optional tagging
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add index for tags if you plan to search by them
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags) WHERE tags IS NOT NULL;
