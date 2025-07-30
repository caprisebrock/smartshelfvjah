import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, messages } = req.body;

    if (!sessionId || !messages) {
      return res.status(400).json({ error: 'Session ID and messages are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create a summary of the conversation for title generation
    const conversationSummary = messages
      .slice(-4) // Take last 4 messages for context
      .map((msg: any) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate a short, descriptive title (3-6 words) for this learning conversation. The title should capture the main topic or theme being discussed. Return only the title, nothing else.`
        },
        {
          role: 'user',
          content: `Generate a title for this conversation:\n\n${conversationSummary}`
        }
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const title = completion.choices[0]?.message?.content?.trim() || 'Learning Discussion';

    res.status(200).json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 