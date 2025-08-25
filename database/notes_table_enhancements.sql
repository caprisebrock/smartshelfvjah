-- Enhance notes table with advanced features from the mega prompt
-- Add missing columns for pinning, time tracking, and timestamps

-- Add columns if they don't exist
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS editing_duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing notes to have last_edited_at if null
UPDATE notes 
SET last_edited_at = updated_at 
WHERE last_edited_at IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_last_edited ON notes(last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned_edited ON notes(user_id, is_pinned DESC, last_edited_at DESC);

-- Update the note_ai_messages table to include tokens tracking
ALTER TABLE note_ai_messages 
ADD COLUMN IF NOT EXISTS tone TEXT,
ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0;
