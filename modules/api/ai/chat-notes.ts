// COPY THIS ENTIRE FILE FROM: pages/api/chat-notes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions for request/response
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
}

interface ChatResponse {
  response?: {
    role: 'assistant';
    content: string;
  };
  error?: string;
  detail?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  console.log('🔍 API route hit - /api/chat-notes');
  console.log('📝 Request method:', req.method);
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔑 OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({
      error: 'Method not allowed. Only POST requests are supported.',
    });
  }

  // Validate request body exists
  if (!req.body) {
    console.log('❌ No request body found');
    return res.status(400).json({
      error: 'Request body is required.',
    });
  }

  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      return res.status(500).json({
        error: 'AI service not configured. Please try again later.',
        detail: 'OpenAI API key missing',
      });
    }

    console.log('✅ OpenAI API key found');

    // Validate request body
    const { messages, sessionId }: ChatRequest = req.body;

    console.log('📨 Messages from request:', JSON.stringify(messages, null, 2));
    console.log('🔗 Session ID:', sessionId);

    if (!messages || !Array.isArray(messages)) {
      console.log('❌ Invalid messages format:', typeof messages);
      return res.status(400).json({
        error: 'Invalid request format. Messages array is required.',
      });
    }

    if (messages.length === 0) {
      console.log('❌ Empty messages array');
      return res.status(400).json({
        error: 'At least one message is required.',
      });
    }

    console.log('✅ Messages validation passed');

    // Validate each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      if (!message || typeof message !== 'object') {
        return res.status(400).json({
          error: `Invalid message format at index ${i}.`,
        });
      }

      if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
        return res.status(400).json({
          error: `Invalid message role at index ${i}. Must be 'user', 'assistant', or 'system'.`,
        });
      }

      if (!message.content || typeof message.content !== 'string') {
        return res.status(400).json({
          error: `Message content cannot be empty at index ${i}.`,
        });
      }

      if (message.content.trim().length === 0) {
        return res.status(400).json({
          error: `Message content cannot be empty at index ${i}.`,
        });
      }
    }

    // Ensure the last message is from the user
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return res.status(400).json({
        error: 'The last message must be from the user.',
      });
    }

    // Notes-specific system prompt for structured, study-ready responses
    const notesSystemMessage: ChatMessage = {
      role: 'system',
      content: `You are "SmartShelf Notes Assistant", an AI designed specifically for creating structured, study-ready notes.

IMPORTANT GUIDELINES:
- Produce clear, organized responses with proper structure
- Use headings (H2/H3) to organize information logically
- Include bulleted lists for key points, definitions, and concepts
- Provide concise explanations that are easy to review later
- End with a "Takeaways" section summarizing the main points
- Include "Questions to Review" for self-assessment
- Keep responses comprehensive but focused (aim for 300-600 words)

RESPONSE STRUCTURE:
1. **Main Content**: Organized with clear headings and bullet points
2. **Key Terms**: Important definitions and concepts
3. **Takeaways**: 3-5 main points to remember
4. **Questions to Review**: 2-3 questions for self-assessment

COPYRIGHT SAFETY:
- NEVER provide verbatim excerpts from copyrighted books or materials
- Always summarize and explain concepts in your own words
- Focus on concepts, ideas, and understanding rather than exact text

CONTEXT AWARENESS:
- If this is related to a specific learning resource, reference it appropriately
- If this builds on previous notes, maintain continuity
- Adapt the structure based on the complexity of the topic

Be helpful, encouraging, and focused on creating notes that will be valuable for study and review.`
    };

    // Add system message to the beginning if not already present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [notesSystemMessage, ...messages];

    // Call OpenAI API with notes-optimized configuration
    console.log('🤖 Calling OpenAI API with notes-optimized config...');
    
    let chatCompletion;
    try {
      chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o', // Use the best available high-quality model
        messages: messagesWithSystem,
        max_tokens: 900, // Allow decent-length structured responses
        temperature: 0.4, // Balanced creativity and consistency
        presence_penalty: 0.1, // Slight penalty for repetition
        frequency_penalty: 0.1, // Slight penalty for overused phrases
      });

      console.log('✅ OpenAI API call successful');
      console.log('📥 Full OpenAI response:', JSON.stringify(chatCompletion, null, 2));
      console.log('📥 OpenAI response choices:', JSON.stringify(chatCompletion.choices, null, 2));
    } catch (openaiError: any) {
      console.error('❌ OpenAI API error:', openaiError);
      console.error('❌ OpenAI error message:', openaiError.message);
      console.error('❌ OpenAI error status:', openaiError.status);
      console.error('❌ OpenAI error response data:', openaiError.response?.data);
      console.error('❌ OpenAI error type:', openaiError.type);
      console.error('❌ OpenAI error code:', openaiError.code);
      
      throw openaiError;
    }

    // Extract the assistant's response
    const assistantMessage = chatCompletion.choices[0]?.message;
    
    if (!assistantMessage || !assistantMessage.content) {
      console.log('❌ No assistant message in OpenAI response');
      return res.status(500).json({
        error: 'Failed to generate response. Please try again later.',
        detail: 'No response content from OpenAI',
      });
    }

    console.log('✅ Assistant message extracted:', assistantMessage.content);

    // Return successful response
    console.log('✅ Sending successful response to client');
    console.log('📤 Response content:', assistantMessage.content);
    
    const responseData: ChatResponse = {
      response: {
        role: 'assistant' as const,
        content: assistantMessage.content,
      },
    };
    
    console.log('📤 Final response JSON:', JSON.stringify(responseData, null, 2));
    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error('❌ Chat Notes API error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return res.status(500).json({
        error: 'AI service authentication failed. Please try again later.',
        detail: 'OpenAI API key invalid',
      });
    }

    if (error?.status === 429) {
      return res.status(500).json({
        error: 'AI service is temporarily overloaded. Please try again in a moment.',
        detail: 'OpenAI rate limit exceeded',
      });
    }

    if (error?.status === 400) {
      return res.status(500).json({
        error: 'Invalid request to AI service. Please try again later.',
        detail: 'OpenAI request validation failed',
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Failed to generate response. Please try again later.',
      detail: error?.message || 'Unknown error occurred',
    });
  }
} 