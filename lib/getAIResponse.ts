import { supabase } from './supabaseClient';

// Type definitions
interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  token_count: number;
  word_count: number;
  link_type?: 'habit' | 'learning_resource' | 'general';
  linked_habit?: string;
  linked_learning_resource?: string;
}

interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
  token_count: number;
}

interface AIResponseResult {
  sessionId?: string;
  aiResponse: string;
}

/**
 * Gets AI response for a message, optionally with linked resource context
 * @param userMessage - The user's message content
 * @param previousMessages - Array of previous messages in the conversation
 * @param sessionId - Optional session ID to get linked resource information
 * @returns Promise<AIResponseResult> - Object containing sessionId and AI response
 */
export async function getAIResponse(
  userMessage: string, 
  previousMessages: Message[] = [],
  sessionId?: string
): Promise<AIResponseResult> {
  console.log('🚀 [getAIResponse] Starting function with message:', userMessage);
  
  try {
    // 1. Get current user with robust error handling
    console.log('👤 [getAIResponse] Getting current user...');
    
    let user;
    try {
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ [getAIResponse] Auth error getting user:', userError);
        console.error('USER ERROR:', JSON.stringify(userError, null, 2));
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!authData) {
        console.error('❌ [getAIResponse] No auth data returned');
        throw new Error('No authentication data available');
      }
      
      if (!authData.user) {
        console.error('❌ [getAIResponse] No user found in auth data');
        console.error('AUTH DATA:', JSON.stringify(authData, null, 2));
        throw new Error('User not authenticated - please log in again');
      }
      
      user = authData.user;
      console.log('✅ [getAIResponse] User found:', user.id);
      console.log('👤 [getAIResponse] User details:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      });
      
    } catch (authError: any) {
      console.error('❌ [getAIResponse] User authentication failed:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    // 2. Build linked resource and note context if sessionId provided
    let linkedResourceContext = '';
    let noteContext = '';
    if (sessionId) {
      console.log('🔗 [getAIResponse] Checking for session context...');
      try {
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('linked_learning_resource, note_id')
          .eq('id', sessionId)
          .single();
        if (sessionData?.linked_learning_resource) {
          const { data: resourceData } = await supabase
            .from('learning_resources')
            .select('type, title, author, total_minutes, minutes_completed, streak_days')
            .eq('id', sessionData.linked_learning_resource)
            .single();
          if (resourceData) {
            linkedResourceContext = `Linked ${resourceData.type} "${resourceData.title}" by ${resourceData.author || 'Unknown'}. Duration ${resourceData.total_minutes || 0}m, completed ${resourceData.minutes_completed || 0}m, streak ${resourceData.streak_days || 0} days.`;
          }
        }
        if (sessionData?.note_id) {
          const { data: noteData } = await supabase
            .from('notes')
            .select('title, content')
            .eq('id', sessionData.note_id)
            .single();
          if (noteData) {
            const summary = compressContent(noteData.content);
            noteContext = `Note: ${noteData.title || 'Untitled'}. Summary: ${summary}`;
          }
        }
      } catch (e) {
        console.error('❌ [getAIResponse] Failed to build context', e);
      }
    }

    // 3. Prepare messages for OpenAI API
    console.log('🤖 [getAIResponse] Preparing messages for OpenAI...');
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // Add combined context
    const systemContext = [linkedResourceContext, noteContext].filter(Boolean).join(' \n ');
    if (systemContext) messages.push({ role: 'system', content: systemContext });

    // Add previous messages
    messages.push(...previousMessages.map(msg => ({
      role: msg.sender as 'user' | 'assistant',
      content: msg.content
    })));

    // Add the current user message
    messages.push({
      role: 'user' as const,
      content: userMessage
    });

    const requestPayload = { messages };
    console.log('📤 [getAIResponse] Sending to OpenAI API:', JSON.stringify(requestPayload, null, 2));

    // 4. Call OpenAI API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    console.log('📥 [getAIResponse] OpenAI response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ [getAIResponse] OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('📥 [getAIResponse] OpenAI parsed response:', data);

    if (!data?.response?.content) {
      console.error('❌ [getAIResponse] Invalid OpenAI response format:', data);
      throw new Error("No content from AI response");
    }

    const aiResponse = data.response.content;
    console.log('✅ [getAIResponse] AI Response received:', aiResponse);

    // Persisting AI message is handled by caller now

    // 7. Return success result
    console.log('🎉 [getAIResponse] Function completed successfully');
    console.log('📊 [getAIResponse] Final result:', {
      sessionId,
      aiResponseLength: aiResponse.length
    });

    return {
      sessionId,
      aiResponse
    };

  } catch (error: any) {
    console.error('❌ [getAIResponse] Function failed:', error);
    console.error('❌ [getAIResponse] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

// Compact note content for prompt to ~1000 chars
function compressContent(content: any): string {
  try {
    const raw = typeof content === 'string' ? content : JSON.stringify(content);
    if (!raw) return '';
    const trimmed = raw.replace(/\s+/g, ' ').slice(0, 1000);
    return trimmed;
  } catch {
    return '';
  }
}

/**
 * Helper function to create a session without getting AI response
 * Useful for testing session creation independently
 */
export async function createSessionOnly(): Promise<string> {
  console.log('🚀 [createSessionOnly] Starting session creation...');
  
  try {
    // Get current user with robust error handling
    let user;
    try {
      const { data: authData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ [createSessionOnly] Auth error getting user:', userError);
        console.error('USER ERROR:', JSON.stringify(userError, null, 2));
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!authData) {
        console.error('❌ [createSessionOnly] No auth data returned');
        throw new Error('No authentication data available');
      }
      
      if (!authData.user) {
        console.error('❌ [createSessionOnly] No user found in auth data');
        console.error('AUTH DATA:', JSON.stringify(authData, null, 2));
        throw new Error('User not authenticated - please log in again');
      }
      
      user = authData.user;
      console.log('✅ [createSessionOnly] User found:', user.id);
      
    } catch (authError: any) {
      console.error('❌ [createSessionOnly] User authentication failed:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    // Create session with only valid fields
    const sessionData = {
      user_id: user.id,
      title: 'Test Session',
      token_count: 0,
      word_count: 0
      // Note: No 'id' field - let Supabase autogenerate it
      // Note: No 'created_at' field - let Supabase set it
      // Note: No 'updated_at' field - let Supabase set it
    };

    console.log('SESSION DATA:', JSON.stringify(sessionData, null, 2));

    let newSession;
    try {
      const { data, error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        console.error('SESSION ERROR:', JSON.stringify(sessionError, null, 2));
        throw new Error(`Session creation failed: ${sessionError.message}`);
      }

      if (!data) {
        console.error('❌ [createSessionOnly] No session data returned from insert');
        throw new Error('Session creation returned no data');
      }

      newSession = data;
      console.log('SESSION SUCCESS:', JSON.stringify(newSession, null, 2));
      return newSession.id.toString();

    } catch (sessionError: any) {
      console.error('❌ [createSessionOnly] Session creation failed:', sessionError);
      throw new Error(`Session creation failed: ${sessionError.message}`);
    }

  } catch (error: any) {
    console.error('❌ [createSessionOnly] Failed:', error);
    throw error;
  }
} 