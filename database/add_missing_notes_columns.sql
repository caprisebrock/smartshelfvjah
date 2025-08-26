-- Add missing columns to notes table if they don't exist
DO $$
BEGIN
    -- Add is_pinned column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notes'
        AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE notes ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add editing_duration_minutes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notes'
        AND column_name = 'editing_duration_minutes'
    ) THEN
        ALTER TABLE notes ADD COLUMN editing_duration_minutes INTEGER DEFAULT 0;
    END IF;

    -- Add last_edited_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notes'
        AND column_name = 'last_edited_at'
    ) THEN
        ALTER TABLE notes ADD COLUMN last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update existing notes to have last_edited_at if null
UPDATE notes 
SET last_edited_at = updated_at 
WHERE last_edited_at IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_last_edited ON notes(last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned_edited ON notes(user_id, is_pinned DESC, last_edited_at DESC);
