import type { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService, Book } from '../../lib/db';

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
      author,
      duration,
      progress,
      status,
      notes,
      userId
    } = req.body;

    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({ 
        error: 'Title and author are required' 
      });
    }

    // Validate status
    const validStatuses = ['not-started', 'in-progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status value' 
      });
    }

    // Validate progress
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({ 
        error: 'Progress must be between 0 and 100' 
      });
    }

    const bookData: Omit<Book, 'id'> = {
      title: title.trim(),
      author: author.trim(),
      duration: duration || 0,
      progress: progress || 0,
      status: status || 'not-started',
      notes: notes || '',
      dateAdded: new Date().toISOString(),
      userId: userId || undefined,
    };

    const newBook = await DatabaseService.addBook(bookData);

    res.status(201).json({
      success: true,
      book: newBook,
      message: 'Book added successfully'
    });

  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to add book'
    });
  }
} 