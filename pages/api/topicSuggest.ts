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
    const { userId } = req.body;

    // Get user's notes and books for analysis
    const userNotes = await DatabaseService.getNotes(userId);
    const userBooks = await DatabaseService.getBooks(userId);

    // Prepare recent activity data
    const recentActivity = {
      books: userBooks,
      notes: userNotes
    };

    // Get study recommendations from AI
    const recommendations = await OpenAIService.getStudyRecommendations(
      userNotes,
      recentActivity
    );

    // Get key insights from current notes
    const keyInsights = await OpenAIService.extractKeyInsights(userNotes);

    // Generate discussion questions
    const discussionQuestions = await OpenAIService.generateDiscussionQuestions(userNotes);

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        keyInsights,
        discussionQuestions,
        stats: {
          totalNotes: userNotes.length,
          totalBooks: userBooks.length,
          completedBooks: userBooks.filter(book => book.status === 'completed').length
        }
      },
      message: 'Study suggestions generated successfully'
    });

  } catch (error) {
    console.error('Error generating topic suggestions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate study suggestions'
    });
  }
} 