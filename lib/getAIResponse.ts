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
  sessionId: string;
  aiResponse: string;
}

/**
 * Creates a new session in Supabase and gets AI response
 * @param userMessage - The user's message content
 * @param previousMessages - Array of previous messages in the conversation
 * @returns Promise<AIResponseResult> - Object containing sessionId and AI response
 */
export async function getAIResponse(
  userMessage: string, 
  previousMessages: Message[] = []
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

    // 2. Create new session in Supabase (let Supabase autogenerate the ID)
    console.log('📝 [getAIResponse] Creating new session...');
    
    // Only include valid fields that exist in the sessions table
    const sessionData = {
      user_id: user.id,
      title: 'New Chat Session',
      token_count: 0,
      word_count: 0
      // Note: No 'id' field - let Supabase autogenerate it
      // Note: No 'created_at' field - let Supabase set it
      // Note: No 'updated_at' field - let Supabase set it
      // Note: No 'link_type' field - not in your schema
      // Note: No 'linked_habit' field - optional, not setting
      // Note: No 'linked_learning_resource' field - optional, not setting
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
        console.error('❌ [getAIResponse] Session creation failed:', sessionError);
        console.error('SESSION ERROR:', JSON.stringify(sessionError, null, 2));
        throw new Error(`Session creation failed: ${sessionError.message}`);
      }

      if (!data) {
        console.error('❌ [getAIResponse] No session data returned from insert');
        throw new Error('Session creation returned no data');
      }

      newSession = data;
      console.log('SESSION SUCCESS:', JSON.stringify(newSession, null, 2));
      console.log('✅ [getAIResponse] Session created successfully:', newSession.id);

    } catch (sessionError: any) {
      console.error('❌ [getAIResponse] Session creation failed:', sessionError);
      throw new Error(`Session creation failed: ${sessionError.message}`);
    }

    const sessionId = newSession.id.toString();

    // 3. Save user message to session_messages
    console.log('💾 [getAIResponse] Saving user message...');
    const userMessageData = {
      session_id: sessionId,
      sender: 'user' as const,
      content: userMessage.trim(),
      token_count: 0
    };

    console.log('USER MESSAGE DATA:', JSON.stringify(userMessageData, null, 2));

    const { data: userMessageResult, error: userMessageError } = await supabase
      .from('session_messages')
      .insert(userMessageData)
      .select()
      .single();

    if (userMessageError) {
      console.error('❌ [getAIResponse] Failed to save user message:', userMessageError);
      console.error('USER MESSAGE ERROR:', JSON.stringify(userMessageError, null, 2));
      throw new Error('Could not save user message');
    }

    console.log('✅ [getAIResponse] User message saved:', userMessageResult.id);

    // 4. Prepare messages for OpenAI API
    console.log('🤖 [getAIResponse] Preparing messages for OpenAI...');
    const messages = previousMessages.map(msg => ({
      role: msg.sender as 'user' | 'assistant',
      content: msg.content
    }));

    // Add the current user message
    messages.push({
      role: 'user' as const,
      content: userMessage
    });

    const requestPayload = { messages };
    console.log('📤 [getAIResponse] Sending to OpenAI API:', JSON.stringify(requestPayload, null, 2));

    // 5. Call OpenAI API
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

    // 6. Save AI message to session_messages
    console.log('💾 [getAIResponse] Saving AI message...');
    const aiMessageData = {
      session_id: sessionId,
      sender: 'assistant' as const,
      content: aiResponse,
      token_count: 0
    };

    console.log('AI MESSAGE DATA:', JSON.stringify(aiMessageData, null, 2));

    const { data: aiMessageResult, error: aiMessageError } = await supabase
      .from('session_messages')
      .insert(aiMessageData)
      .select()
      .single();

    if (aiMessageError) {
      console.error('❌ [getAIResponse] Failed to save AI message:', aiMessageError);
      console.error('AI MESSAGE ERROR:', JSON.stringify(aiMessageError, null, 2));
      throw new Error('Could not save AI reply');
    }

    console.log('✅ [getAIResponse] AI message saved:', aiMessageResult.id);

    // 7. Return success result
    console.log('🎉 [getAIResponse] Function completed successfully');
    console.log('📊 [getAIResponse] Final result:', {
      sessionId,
      userMessageId: userMessageResult.id,
      aiMessageId: aiMessageResult.id,
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