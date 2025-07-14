import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '../../lib/openai';
import { DatabaseService } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      numQuestions,
      difficulty,
      category
    } = req.body;

    // Validate number of questions
    const questionCount = parseInt(numQuestions) || 5;
    if (questionCount < 1 || questionCount > 20) {
      return res.status(400).json({ 
        error: 'Number of questions must be between 1 and 20' 
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    const selectedDifficulty = difficulty || 'medium';
    if (!validDifficulties.includes(selectedDifficulty)) {
      return res.status(400).json({ 
        error: 'Invalid difficulty level' 
      });
    }

    // Get user's notes
    let userNotes = await DatabaseService.getNotes(userId);

    // Filter by category if specified
    if (category && category !== 'all') {
      userNotes = userNotes.filter(note => note.category === category);
    }

    // Check if user has enough notes
    if (userNotes.length === 0) {
      return res.status(400).json({ 
        error: 'No notes found to generate quiz from',
        message: 'Please add some notes first before generating a quiz'
      });
    }

    // Generate quiz questions
    const quizQuestions = await OpenAIService.generateQuiz(
      userNotes,
      questionCount,
      selectedDifficulty
    );

    res.status(200).json({
      success: true,
      quiz: {
        questions: quizQuestions,
        totalQuestions: quizQuestions.length,
        difficulty: selectedDifficulty,
        category: category || 'all',
        notesUsed: userNotes.length
      },
      message: 'Quiz generated successfully'
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate quiz'
    });
  }
} 