// COPY THIS ENTIRE FILE FROM: pages/api/chat.ts
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
  messages?: ChatMessage[];
  message?: string;
  mode?: string;
}

interface ChatResponse {
  response?: string | {
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
  console.log('🔍 API route hit - /api/chat');
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
    const { messages, message, mode }: ChatRequest = req.body;

    console.log('📨 Messages from request:', JSON.stringify(messages, null, 2));
    console.log('🔍 Mode:', mode);
    console.log('💬 Single message:', message);

    // Handle milestone mode specifically
    if (mode === 'milestone' && message) {
      console.log('🎯 Processing milestone generation request');
      
      try {
        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a learning coach. Create detailed, actionable daily milestones for learning resources. Focus on specific time-based goals and practical steps. Format your response as a bullet-point list with clear daily objectives.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 800,
          temperature: 0.7,
        });

        const content = chatCompletion.choices[0]?.message?.content || 'No milestone plan generated.';
        console.log('✅ Milestone generation successful');
        
        return res.status(200).json({
          response: content
        });
      } catch (error) {
        console.error('❌ Milestone generation error:', error);
        return res.status(500).json({
          error: 'Failed to generate milestones',
          detail: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Original chat mode validation
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
          error: `Invalid message content at index ${i}. Content must be a string.`,
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

    // Prepare system message for SmartShelf context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are SmartShelf, an AI learning assistant designed to help users with their educational journey. You can help with:

- Book summaries and insights
- Study planning and organization
- Learning habit development
- Note-taking strategies
- Resource recommendations
- Progress tracking and motivation

Be helpful, encouraging, and focused on learning outcomes. Keep responses concise but informative. If a user mentions a specific book, resource, or habit, provide relevant insights and suggestions.`
    };

    // Add system message to the beginning if not already present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [systemMessage, ...messages];

    // Call OpenAI API with simplified logic
    console.log('🤖 Calling OpenAI API...');
    
    // Create a simple test message for debugging
    const testMessages = [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant. Respond briefly and clearly.'
      },
      {
        role: 'user' as const,
        content: messages[messages.length - 1].content
      }
    ];
    
    console.log('📤 Test messages being sent to OpenAI:', JSON.stringify(testMessages, null, 2));

    let chatCompletion;
    try {
      chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: testMessages,
        max_tokens: 500,
        temperature: 0.7,
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
    console.error('❌ Chat API error:', error);
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