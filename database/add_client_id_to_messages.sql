-- Add client_id column to session_messages table for deduplication
ALTER TABLE session_messages ADD COLUMN IF NOT EXISTS client_id TEXT;

-- Create index on client_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_session_messages_client_id ON session_messages(client_id);

-- Create composite index for efficient deduplication queries
CREATE INDEX IF NOT EXISTS idx_session_messages_session_client ON session_messages(session_id, client_id);

-- Add comment explaining the purpose
COMMENT ON COLUMN session_messages.client_id IS 'Client-generated UUID for deduplicating messages between local state and database'; 