-- Comprehensive database setup for the advanced notes system
-- Run this script to ensure all tables and functions are properly set up

-- 1. First, ensure basic notes table exists with all required columns
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    linked_resource_id UUID REFERENCES learning_resources(id) ON DELETE SET NULL,
    linked_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    editing_duration_minutes INTEGER DEFAULT 0,
    last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;
CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Create note_ai_messages table
CREATE TABLE IF NOT EXISTS note_ai_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message TEXT NOT NULL,
    tone TEXT,
    tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS for note_ai_messages
ALTER TABLE note_ai_messages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for note_ai_messages
DROP POLICY IF EXISTS "Users can view their own note AI messages" ON note_ai_messages;
CREATE POLICY "Users can view their own note AI messages" ON note_ai_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert their own note AI messages" ON note_ai_messages;
CREATE POLICY "Users can insert their own note AI messages" ON note_ai_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete their own note AI messages" ON note_ai_messages;
CREATE POLICY "Users can delete their own note AI messages" ON note_ai_messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM notes WHERE id = note_id AND user_id = auth.uid())
    );

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_linked_resource ON notes(linked_resource_id) WHERE linked_resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_linked_habit ON notes(linked_habit_id) WHERE linked_habit_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_last_edited ON notes(last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned_edited ON notes(user_id, is_pinned DESC, last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_ai_messages_note_id ON note_ai_messages(note_id);

-- 8. Create get_note_context function
CREATE OR REPLACE FUNCTION get_note_context(note_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    note_data RECORD;
BEGIN
    -- Get the note data with joined learning resource and habit info
    SELECT n.*, 
           lr.title as resource_title, lr.emoji as resource_emoji, lr.type as resource_type, 
           lr.duration_minutes, lr.progress_minutes,
           CASE 
               WHEN lr.duration_minutes > 0 THEN ROUND((lr.progress_minutes::DECIMAL / lr.duration_minutes * 100), 1)
               ELSE 0 
           END as progress_percentage,
           h.title as habit_title, h.emoji as habit_emoji,
           -- Calculate habit streak (simplified - you can enhance this)
           0 as habit_streak
    INTO note_data
    FROM notes n
    LEFT JOIN learning_resources lr ON n.linked_resource_id = lr.id
    LEFT JOIN habits h ON n.linked_habit_id = h.id
    WHERE n.id = note_uuid;
    
    -- Return null if note not found
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Build the JSON response
    SELECT json_build_object(
        'note_id', note_data.id,
        'note_title', note_data.title,
        'tags', note_data.tags,
        'learning_resource', CASE 
            WHEN note_data.linked_resource_id IS NOT NULL THEN
                json_build_object(
                    'id', note_data.linked_resource_id,
                    'title', note_data.resource_title,
                    'emoji', note_data.resource_emoji,
                    'type', note_data.resource_type,
                    'duration_minutes', note_data.duration_minutes,
                    'progress_minutes', note_data.progress_minutes,
                    'progress_percentage', note_data.progress_percentage
                )
            ELSE NULL
        END,
        'habit', CASE 
            WHEN note_data.linked_habit_id IS NOT NULL THEN
                json_build_object(
                    'id', note_data.linked_habit_id,
                    'title', note_data.habit_title,
                    'emoji', note_data.habit_emoji,
                    'streak', note_data.habit_streak
                )
            ELSE NULL
        END
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION get_note_context(UUID) TO authenticated;

-- 10. Update trigger for notes updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration complete!
SELECT 'Notes system database setup complete!' as status;
