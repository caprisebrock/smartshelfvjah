// COPY THIS ENTIRE FILE FROM: pages/api/chat-name.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { text } = req.body;

  if (!text) return res.status(400).json({ name: 'Untitled Chat' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that summarizes a chat into a short session title.',
        },
        {
          role: 'user',
          content: `Here are the first few messages:\n\n${text}\n\nWhat would be a short session name? Return only the title, no other explanation.`,
        },
      ],
      max_tokens: 30,
      temperature: 0.5,
    });

    const name = completion.choices?.[0]?.message?.content?.trim();

    return res.status(200).json({
      name: name || 'Untitled Chat',
    });
  } catch (e) {
    return res.status(500).json({ name: 'Untitled Chat' });
  }
} 