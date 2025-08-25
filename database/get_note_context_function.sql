-- Create get_note_context function for AI chat context awareness
CREATE OR REPLACE FUNCTION get_note_context(note_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    note_data RECORD;
    resource_data RECORD;
    habit_data RECORD;
BEGIN
    -- Get the note data
    SELECT n.*, lr.title as resource_title, lr.emoji as resource_emoji, lr.type as resource_type, 
           lr.duration_minutes, lr.progress_minutes,
           CASE 
               WHEN lr.duration_minutes > 0 THEN ROUND((lr.progress_minutes::DECIMAL / lr.duration_minutes * 100), 1)
               ELSE 0 
           END as progress_percentage,
           h.title as habit_title, h.emoji as habit_emoji,
           -- Calculate habit streak (simplified version)
           0 as habit_streak
    INTO note_data
    FROM notes n
    LEFT JOIN learning_resources lr ON n.linked_resource_id = lr.id
    LEFT JOIN habits h ON n.linked_habit_id = h.id
    WHERE n.id = note_uuid;
    
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_note_context(UUID) TO authenticated;
