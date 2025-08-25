-- Advanced Notes System Schema
-- Run this in Supabase SQL Editor to set up the enhanced notes system

-- 1. Enhance the existing notes table with new columns
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS editing_duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create note_ai_messages table for per-note AI chat
CREATE TABLE IF NOT EXISTS note_ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  tone TEXT CHECK (tone IN ('summary', 'bullet_points', 'deep_insight')),
  tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_ai_messages_note_id ON note_ai_messages(note_id);
CREATE INDEX IF NOT EXISTS idx_note_ai_messages_created_at ON note_ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags) WHERE tags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_last_edited ON notes(last_edited_at DESC);

-- 4. Enable Row Level Security (RLS) for note_ai_messages
ALTER TABLE note_ai_messages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for note_ai_messages
CREATE POLICY "Users can view AI messages for their own notes" ON note_ai_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = note_ai_messages.note_id 
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert AI messages for their own notes" ON note_ai_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = note_ai_messages.note_id 
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update AI messages for their own notes" ON note_ai_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = note_ai_messages.note_id 
      AND notes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete AI messages for their own notes" ON note_ai_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = note_ai_messages.note_id 
      AND notes.user_id = auth.uid()
    )
  );

-- 6. Create trigger to automatically update last_edited_at for notes
CREATE OR REPLACE FUNCTION update_notes_last_edited()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notes_last_edited_trigger ON notes;
CREATE TRIGGER update_notes_last_edited_trigger
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_last_edited();

-- 7. Create function to get note context for AI
CREATE OR REPLACE FUNCTION get_note_context(note_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'note_title', n.title,
    'note_content', n.content,
    'learning_resource', CASE 
      WHEN lr.id IS NOT NULL THEN json_build_object(
        'title', lr.title,
        'type', lr.type,
        'progress_minutes', lr.progress_minutes,
        'duration_minutes', lr.duration_minutes,
        'progress_percentage', ROUND((lr.progress_minutes::FLOAT / NULLIF(lr.duration_minutes, 0)) * 100, 1)
      )
      ELSE NULL
    END,
    'habit', CASE 
      WHEN h.id IS NOT NULL THEN json_build_object(
        'title', h.title,
        'emoji', h.emoji,
        'streak', h.current_streak
      )
      ELSE NULL
    END,
    'tags', n.tags
  ) INTO result
  FROM notes n
  LEFT JOIN learning_resources lr ON n.linked_resource_id = lr.id
  LEFT JOIN habits h ON n.linked_habit_id = h.id
  WHERE n.id = note_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE note_ai_messages IS 'AI chat messages tied to specific notes';
COMMENT ON FUNCTION get_note_context IS 'Returns contextual information about a note for AI chat';

-- Insert notification
DO $$
BEGIN
  RAISE NOTICE 'Advanced Notes schema created successfully!';
  RAISE NOTICE 'Tables: notes (enhanced), note_ai_messages';
  RAISE NOTICE 'Functions: get_note_context() for AI awareness';
  RAISE NOTICE 'Ready for advanced Notes system with per-note AI chat';
END $$;
