// COPY THIS ENTIRE FILE FROM: pages/api/ask.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService, ChatMessage } from '../../../lib/openai';
import { DatabaseService } from '../../database/config/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      question,
      userId,
      conversationHistory
    } = req.body;

    // Validate required fields
    if (!question) {
      return res.status(400).json({ 
        error: 'Question is required' 
      });
    }

    // Validate conversation history format
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({ 
        error: 'Conversation history must be an array' 
      });
    }

    // Get user's notes for context
    const userNotes = await DatabaseService.getNotes(userId);

    // Prepare conversation history
    const history: ChatMessage[] = conversationHistory || [];

    // Ask AI about the notes
    const aiResponse = await OpenAIService.askAboutNotes(
      question.trim(),
      userNotes,
      history
    );

    res.status(200).json({
      success: true,
      response: aiResponse,
      notesUsed: userNotes.length,
      message: 'AI response generated successfully'
    });

  } catch (error) {
    console.error('Error processing AI request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get AI response'
    });
  }
} 