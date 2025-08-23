// COPY THIS ENTIRE FILE FROM: lib/generateSessionTitle.ts
// Move the complete contents of lib/generateSessionTitle.ts into this file 
/**
 * Generates a smart session title based on the first few user messages
 * @param messages Array of user messages (first 2-3 messages)
 * @param includeEmoji Whether to include emoji in the title (default: true)
 * @returns A readable title for the session
 */
export function generateSessionTitle(messages: string[], includeEmoji: boolean = true): string {
    try {
      if (!messages || messages.length === 0) {
        return includeEmoji ? '💬 New Chat' : 'New Chat';
      }
  
      // Take first 2-3 messages and join them
      const firstMessages = messages.slice(0, 3);
      const combinedText = firstMessages.join(' ').toLowerCase();
  
      // Simple keyword-based title generation
      const title = generateTitleFromKeywords(combinedText, includeEmoji);
      
      // Ensure we always return a valid string
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return includeEmoji ? '💬 New Chat' : 'New Chat';
      }
      
      // Truncate to ~50 characters for neat sidebar display
      const finalTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
      return finalTitle || (includeEmoji ? '💬 New Chat' : 'New Chat');
    } catch (error) {
      console.error('Error in generateSessionTitle:', error);
      // Return a safe fallback title
      return includeEmoji ? '💬 New Chat' : 'New Chat';
    }
  }
  
  /**
   * Generates a title based on keywords in the text
   * @param text Combined text from first few messages
   * @param includeEmoji Whether to include emoji in the title
   * @returns A readable title
   */
  function generateTitleFromKeywords(text: string, includeEmoji: boolean = true): string {
    try {
      // Common topics and their associated keywords with emojis
      const topicKeywords: Record<string, { keywords: string[], emoji: string }> = {
        'Productivity': { keywords: ['productivity', 'efficient', 'time management', 'workflow', 'routine', 'schedule', 'planning'], emoji: '⚡' },
        'Learning': { keywords: ['learn', 'study', 'education', 'course', 'book', 'reading', 'knowledge', 'skill'], emoji: '📚' },
        'Health': { keywords: ['health', 'fitness', 'exercise', 'workout', 'diet', 'nutrition', 'wellness', 'gym'], emoji: '💪' },
        'Business': { keywords: ['business', 'marketing', 'strategy', 'startup', 'entrepreneur', 'sales', 'growth'], emoji: '💼' },
        'Technology': { keywords: ['tech', 'programming', 'code', 'software', 'app', 'development', 'computer'], emoji: '💻' },
        'Finance': { keywords: ['money', 'finance', 'investment', 'budget', 'saving', 'financial', 'wealth'], emoji: '💰' },
        'Relationships': { keywords: ['relationship', 'dating', 'marriage', 'family', 'friends', 'social'], emoji: '❤️' },
        'Creativity': { keywords: ['creative', 'art', 'design', 'writing', 'music', 'inspiration', 'ideas'], emoji: '🎨' },
        'Travel': { keywords: ['travel', 'vacation', 'trip', 'destination', 'explore', 'adventure'], emoji: '✈️' },
        'Cooking': { keywords: ['cook', 'recipe', 'food', 'meal', 'kitchen', 'cooking', 'chef'], emoji: '👨‍🍳' }
      };
  
    // Find the most relevant topic
    let bestTopic = '';
    let bestEmoji = '💬'; // Default emoji
    let maxMatches = 0;
  
    for (const [topic, data] of Object.entries(topicKeywords)) {
      const matches = data.keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestTopic = topic;
        bestEmoji = data.emoji;
      }
    }
  
    // Extract key phrases from the text
    const words = text.split(' ').filter(word => word.length > 3);
    const keyWords = words.slice(0, 4); // Take first 4 meaningful words
  
    // Generate title based on topic and keywords
    if (bestTopic && maxMatches > 0) {
      const keyPhrase = keyWords.slice(0, 2).join(' ').replace(/[^\w\s]/g, '');
      const topicResult = includeEmoji 
        ? `${bestEmoji} ${bestTopic}: ${capitalizeWords(keyPhrase)}`
        : `${bestTopic}: ${capitalizeWords(keyPhrase)}`;
      
      // Ensure we always return a valid string
      return topicResult || (includeEmoji ? '💬 New Chat' : 'New Chat');
    }
  
    // Fallback: use first few words as title
    const fallbackTitle = keyWords.slice(0, 3).join(' ').replace(/[^\w\s]/g, '');
    const fallbackResult = includeEmoji 
      ? `${bestEmoji} ${capitalizeWords(fallbackTitle)}`
      : `${capitalizeWords(fallbackTitle)}`;
    
    // Ensure we always return a valid string
    return fallbackResult || (includeEmoji ? '💬 New Chat' : 'New Chat');
    } catch (error) {
      console.error('Error in generateTitleFromKeywords:', error);
      // Return a safe fallback title
      return includeEmoji ? '💬 New Chat' : 'New Chat';
    }
  }
  
  /**
   * Capitalizes the first letter of each word
   * @param text Input text
   * @returns Text with capitalized words
   */
  function capitalizeWords(text: string): string {
    try {
      if (!text || typeof text !== 'string') {
        return '';
      }
      return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      console.error('Error in capitalizeWords:', error);
      return text || '';
    }
  }
  
  /**
   * Generates a session title using OpenAI API (more sophisticated)
   * @param messages Array of user messages
   * @param openaiApiKey Optional OpenAI API key
   * @param includeEmoji Whether to include emoji in the title (default: true)
   * @returns Promise<string> A smart title generated by AI
   */
  export async function generateSessionTitleWithAI(
    messages: string[], 
    openaiApiKey?: string,
    includeEmoji: boolean = true
  ): Promise<string> {
    try {
      // Validate inputs and provide fallback
      if (!openaiApiKey || !messages || messages.length === 0) {
        return includeEmoji ? '💬 New Chat' : 'New Chat';
      }
  
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: openaiApiKey });
  
      // Take first 3 messages and create a summary
      const firstMessages = messages.slice(0, 3);
      const combinedText = firstMessages.join('\n');
  
      const systemPrompt = includeEmoji 
        ? 'You are an assistant that writes helpful, short chat titles with one relevant emoji. Return only the title with the emoji at the start.'
        : 'You are an assistant that creates short, descriptive titles for chat sessions. Generate a title that captures the main topic or theme of the conversation. Keep it under 50 characters and make it engaging and clear.';
      
      const userPrompt = includeEmoji
        ? `Create a concise title for the following conversation:\n${combinedText}`
        : `Create a concise title for the following conversation:\n${combinedText}`;
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 20,
        temperature: 0.7,
      });
  
      const title = completion.choices[0]?.message?.content?.trim();
      return title || (includeEmoji ? '💬 New Chat' : 'New Chat');
    } catch (error) {
      console.error('OpenAI error:', error);
      return includeEmoji ? '💬 New Chat' : 'New Chat';
    }
  } 