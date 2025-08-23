-- Complete SmartShelf Database Setup
-- Run this script in your Supabase SQL Editor to set up all required tables

-- 1. Create update function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content JSONB DEFAULT '{}',
  linked_resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create sessions table (for AI chat)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  -- Link metadata fields
  link_type TEXT CHECK (link_type IN ('habit', 'learning_resource', 'general', 'note')),
  link_id UUID,
  link_title TEXT,
  -- Specific link fields for better querying
  linked_habit UUID,
  linked_learning_resource UUID
);

-- 4. Create session_messages table
CREATE TABLE IF NOT EXISTS session_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens INTEGER DEFAULT 0
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_linked_resource ON notes(linked_resource_id) WHERE linked_resource_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_note_link ON sessions(link_type, link_id) WHERE link_type = 'note';

CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages(created_at);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for sessions
CREATE POLICY "Users can view their own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create RLS policies for session_messages
CREATE POLICY "Users can view messages from their sessions" ON session_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their sessions" ON session_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages from their sessions" ON session_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their sessions" ON session_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- 10. Create triggers to automatically update updated_at
CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at 
  BEFORE UPDATE ON sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Create a view for note sessions for easier querying
CREATE OR REPLACE VIEW note_sessions AS
SELECT 
  s.*,
  n.title as note_title
FROM sessions s
LEFT JOIN notes n ON s.link_id::uuid = n.id
WHERE s.link_type = 'note';

-- Grant access to the view
GRANT SELECT ON note_sessions TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SmartShelf database setup completed successfully!';
  RAISE NOTICE 'Created tables: notes, sessions, session_messages';
  RAISE NOTICE 'Created indexes, RLS policies, and triggers';
  RAISE NOTICE 'Ready for Notes AI Chat functionality';
END $$;
