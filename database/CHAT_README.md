# AI Chat Setup for SmartShelf

This document provides setup instructions for the AI Chat functionality in SmartShelf.

## Database Setup

### 1. Create Chat Tables

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of chat_tables.sql
```

This will create:
- `sessions` table for storing chat sessions
- `session_messages` table for storing individual messages
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

### 2. Environment Variables

Make sure you have the following environment variables set in your `.env.local`:

```env
# OpenAI API Key (required for chat functionality)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Implemented

### ✅ Chat Functionality
- **Real-time messaging** with OpenAI GPT-3.5
- **Session management** - each chat is saved as a session
- **Message persistence** - all messages stored in Supabase
- **Auto-scroll** to bottom on new messages
- **Typing indicators** while AI is responding

### ✅ Session Management
- **Create new sessions** with "New Chat" button
- **Load existing sessions** from sidebar
- **Session titles** auto-generated after 2-3 messages
- **Visual session selection** with active state

### ✅ User Experience
- **Responsive design** that works on all screen sizes
- **Loading states** for better UX
- **Error handling** with fallback messages
- **Keyboard shortcuts** (Enter to send, Shift+Enter for new line)
- **Auto-resizing textarea** for better input experience

### ✅ Security
- **Row Level Security** ensures users only see their own data
- **User authentication** required to access chat
- **Proper error handling** for API failures

## API Endpoints

### `/api/chat`
- **Method**: POST
- **Purpose**: Send message to OpenAI and get response
- **Body**: `{ message: string, history: Array<{role: string, content: string}> }`
- **Response**: `{ response: string }`

### `/api/generate-title`
- **Method**: POST
- **Purpose**: Generate session title using AI
- **Body**: `{ sessionId: string, messages: Array<Message> }`
- **Response**: `{ title: string }`

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0
);
```

### Session Messages Table
```sql
CREATE TABLE session_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  sender TEXT CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens INTEGER DEFAULT 0
);
```

## Testing the Implementation

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the AI Chat page**: Navigate to `http://localhost:3000/aichat`

3. **Test the functionality**:
   - Click "New Chat" to start a conversation
   - Send a message and verify AI responds
   - Check that messages are saved in Supabase
   - Create multiple sessions and switch between them
   - Verify session titles are auto-generated

4. **Check database**:
   - Verify sessions are created in the `sessions` table
   - Verify messages are saved in the `session_messages` table
   - Confirm RLS policies are working correctly

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Make sure `OPENAI_API_KEY` is set in `.env.local`
   - Restart the development server after adding the key

2. **"Failed to get AI response"**
   - Check your OpenAI API key is valid
   - Verify you have sufficient OpenAI credits
   - Check the browser console for detailed error messages

3. **Messages not saving**
   - Verify Supabase connection is working
   - Check RLS policies are properly configured
   - Ensure user is authenticated

4. **Sessions not loading**
   - Check user authentication status
   - Verify database tables exist and have correct structure
   - Check browser console for errors

### Debug Mode

To enable debug logging, add this to your `.env.local`:
```env
DEBUG=true
```

This will log detailed information about API calls and database operations to the console.

## Next Steps

The chat functionality is now fully implemented and ready for use! You can extend it further by:

- Adding message editing capabilities
- Implementing conversation export
- Adding conversation search
- Creating conversation templates
- Adding voice input/output
- Implementing conversation sharing 