import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService, Note } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      title,
      content,
      category,
      tags,
      bookTitle,
      isFavorite,
      userId
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    // Validate category
    const validCategories = ['business', 'marketing', 'leadership', 'personal-development', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category value' 
      });
    }

    // Validate tags (should be an array)
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ 
        error: 'Tags must be an array of strings' 
      });
    }

    const noteData: Omit<Note, 'id'> = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'other',
      tags: tags || [],
      bookTitle: bookTitle?.trim() || undefined,
      dateCreated: new Date().toISOString(),
      isFavorite: Boolean(isFavorite),
      userId: userId || undefined,
    };

    const newNote = await DatabaseService.addNote(noteData);

    res.status(201).json({
      success: true,
      note: newNote,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to add note'
    });
  }
} 