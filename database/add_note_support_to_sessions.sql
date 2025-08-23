-- Add 'note' to the link_type constraint for sessions table
-- This allows sessions to be linked to notes

-- First, drop the existing constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_link_type_check;

-- Add the new constraint with 'note' included
ALTER TABLE sessions ADD CONSTRAINT sessions_link_type_check 
  CHECK (link_type IN ('habit', 'learning_resource', 'general', 'note'));

-- Add index for note queries
CREATE INDEX IF NOT EXISTS idx_sessions_note_link ON sessions(link_type, link_id) 
  WHERE link_type = 'note';

-- Create a view for note sessions for easier querying
CREATE OR REPLACE VIEW note_sessions AS
SELECT 
  s.*,
  n.title as note_title
FROM sessions s
LEFT JOIN notes n ON s.link_id::uuid = n.id
WHERE s.link_type = 'note';

-- Grant access to the view
GRANT SELECT ON note_sessions TO authenticated;
