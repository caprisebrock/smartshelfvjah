-- Add tags column to notes table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notes'
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE notes ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- Create index for tags search
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);

-- Comment to explain the column
COMMENT ON COLUMN notes.tags IS 'Array of tags associated with this note';
