// OpenAI API helper functions

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import { Note } from './db';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyRecommendation {
  topic: string;
  reason: string;
  suggestedResources: string[];
  priority: 'low' | 'medium' | 'high';
}

export class OpenAIService {
  // Chat with AI about notes
  static async askAboutNotes(
    question: string,
    notes: Note[],
    conversationHistory: ChatMessage[] = [],
    model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo',
    tone: 'Summary' | 'Detailed' | 'Bullet Points' | 'Insights' = 'Summary'
  ): Promise<{ response: string; tokens: number }> {
    try {
      const systemPrompt = `You are SmartShelf, an AI study assistant. Respond in a helpful, ${tone.toLowerCase()} tone. Context: ${notes.length} notes provided.`;
      const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: question }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      });
      const response = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || 0;
      return { response, tokens };
    } catch (error: any) {
      console.error('Error asking AI:', error);
      throw new Error(error?.message || 'Failed to get AI response');
    }
  }

  // Generate quiz questions from notes
  static async generateQuiz(
    notes: Note[],
    numQuestions: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo'
  ): Promise<QuizQuestion[]> {
    try {
      const systemPrompt = `You are an AI quiz generator. Create ${numQuestions} ${difficulty} quiz questions based on the user's notes.`;
      const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(notes) }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      const response = completion.choices[0]?.message?.content || '';
      // Try to parse as JSON, fallback to string array
      try {
        return JSON.parse(response);
      } catch {
        return [{
          question: response,
          options: [],
          correctAnswer: 0,
          explanation: '',
          difficulty
        }];
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      throw new Error(error?.message || 'Failed to generate quiz');
    }
  }

  // Get study recommendations
  static async getStudyRecommendations(
    notes: Note[],
    recentActivity: { books: any[], notes: Note[] },
    model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo'
  ): Promise<StudyRecommendation[]> {
    try {
      const systemPrompt = `You are an AI study coach. Analyze the user's notes and recent activity to recommend study topics and resources.`;
      const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ notes, recentActivity }) }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 800,
        temperature: 0.7,
      });
      const response = completion.choices[0]?.message?.content || '';
      try {
        return JSON.parse(response);
      } catch {
        return [{
          topic: response,
          reason: '',
          suggestedResources: [],
          priority: 'medium'
        }];
      }
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      throw new Error(error?.message || 'Failed to get recommendations');
    }
  }

  // Summarize notes by topic or time period
  static async summarizeNotes(
    notes: Note[],
    summaryType: 'topic' | 'time-period',
    filter?: string,
    model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo'
  ): Promise<string> {
    try {
      const systemPrompt = `You are an AI summarizer. Summarize the user's notes by ${summaryType}${filter ? `, filter: ${filter}` : ''}.`;
      const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(notes) }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 600,
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Error summarizing notes:', error);
      throw new Error(error?.message || 'Failed to summarize notes');
    }
  }

  // Extract key insights from a collection of notes
  static async extractKeyInsights(notes: Note[], model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo'): Promise<string[]> {
    try {
      const systemPrompt = `You are an AI insights extractor. List key insights from the user's notes.`;
      const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(notes) }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 600,
        temperature: 0.7,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter(Boolean);
    } catch (error: any) {
      console.error('Error extracting insights:', error);
      throw new Error(error?.message || 'Failed to extract insights');
    }
  }

  // Generate conversation starters for learning discussions
  static async generateDiscussionQuestions(notes: Note[], model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo'): Promise<string[]> {
    try {
      const systemPrompt = `You are an AI discussion question generator. Create discussion questions based on the user's notes.`;
      const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(notes) }
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 600,
        temperature: 0.7,
      });
      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter(Boolean);
    } catch (error: any) {
      console.error('Error generating discussion questions:', error);
      throw new Error(error?.message || 'Failed to generate discussion questions');
    }
  }
}

export default OpenAIService; 