import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Lightbulb, FileText, Zap, Copy, Plus } from 'lucide-react';
import { useUser } from '../../auth/hooks/useUser';
import { useToast } from '../../shared/context/ToastContext';
import { supabase } from '../../database/config/databaseConfig';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  tone?: string;
  created_at: string;
}

interface AIChatPanelProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onInsertToNote: (content: string) => void;
  linkedResourceId?: string | null;
  linkedHabitId?: string | null;
}

const TONE_OPTIONS = [
  { value: 'summary', label: 'Summary', icon: '📝' },
  { value: 'bullet_points', label: 'Bullet Points', icon: '•' },
  { value: 'deep_insight', label: 'Deep Insight', icon: '💡' },
];

const SUGGESTED_PROMPTS = [
  "Summarize the key points",
  "Give me actionable insights",
  "What are the main takeaways?",
  "How can I improve this?",
  "Extract important quotes",
  "What questions should I ask?",
];

export default function AIChatPanel({
  noteId,
  noteTitle,
  noteContent,
  onInsertToNote,
  linkedResourceId,
  linkedHabitId
}: AIChatPanelProps) {
  const { user } = useUser();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedTone, setSelectedTone] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for this note
  useEffect(() => {
    if (noteId) {
      loadMessages();
    }
  }, [noteId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('note_ai_messages')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform database format to component format
      const transformedMessages: AIMessage[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        message: msg.message || '', // Use 'message' field as per database schema
        tone: msg.tone,
        created_at: msg.created_at,
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      addToast('Failed to load chat history', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user?.id) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Create user message object
    const userMessageObj: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      message: userMessage,
      created_at: new Date().toISOString(),
    };

    try {

      // Add user message to UI immediately (optimistic update)
      setMessages(prev => [...prev, userMessageObj]);

      // Save user message to database
      const { data: savedUserMessage, error: userError } = await supabase
        .from('note_ai_messages')
        .insert({
          note_id: noteId,
          role: 'user',
          message: userMessage, // Use 'message' as per database schema
          tone: selectedTone,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Update the temporary message with the real database ID
      const updatedUserMessage = { ...userMessageObj, id: savedUserMessage.id };
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageObj.id ? updatedUserMessage : msg
      ));

      // Prepare AI prompt with context (simplified version without RPC)
      let systemPrompt = `You are a helpful AI assistant for note-taking. The user is working on a note titled "${noteTitle}".`;
      
      // Add linked resource context if available
      if (linkedResourceId) {
        systemPrompt += ` This note is linked to a learning resource.`;
      }
      
      // Add linked habit context if available
      if (linkedHabitId) {
        systemPrompt += ` This note is also linked to a habit.`;
      }

      systemPrompt += ` The current note content is: "${noteContent}"`;
      
      // Add tone-specific instructions
      switch (selectedTone) {
        case 'summary':
          systemPrompt += ' Provide concise, clear summaries and overviews.';
          break;
        case 'bullet_points':
          systemPrompt += ' Structure your responses in bullet points and lists.';
          break;
        case 'deep_insight':
          systemPrompt += ' Provide deep insights, connections, and thoughtful analysis.';
          break;
      }

      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          note_id: noteId, // Include note context
          model: 'gpt-3.5-turbo',
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      // Handle the API response format
      let aiResponse: string;
      if (data.choices && data.choices[0]?.message?.content) {
        // OpenAI format
        aiResponse = data.choices[0].message.content;
      } else if (data.response && data.response.content) {
        // Our API format
        aiResponse = data.response.content;
      } else {
        aiResponse = 'Sorry, I could not generate a response.';
      }

      // Create AI message object
      const aiMessageObj: AIMessage = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        message: aiResponse,
        created_at: new Date().toISOString(),
      };

      // Add AI message to UI immediately (optimistic update)
      setMessages(prev => [...prev, aiMessageObj]);

      // Save AI message to database
      const { data: savedAIMessage, error: aiError } = await supabase
        .from('note_ai_messages')
        .insert({
          note_id: noteId,
          role: 'assistant',
          message: aiResponse, // Use 'message' as per database schema
          tone: selectedTone,
        })
        .select()
        .single();

      if (aiError) throw aiError;

      // Update the temporary AI message with the real database ID
      const updatedAIMessage = { ...aiMessageObj, id: savedAIMessage.id };
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageObj.id ? updatedAIMessage : msg
      ));

    } catch (error: any) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        status: error?.status || 'No status',
        code: error?.code || 'No code',
        details: error?.details || 'No details'
      });
      addToast('Failed to send message', 'error');
      // Keep the user message but mark it as failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageObj.id 
          ? { ...msg, message: msg.message + ' (Failed to send)' }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const insertMessageToNote = (message: string) => {
    onInsertToNote(message);
    addToast('Content added to note!', 'success');
  };

  const copyMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      addToast('Copied to clipboard!', 'success');
    } catch (error) {
      addToast('Failed to copy', 'error');
    }
  };

  const sendSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            AI Assistant
          </h3>
          
          {/* Tone Selector */}
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TONE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Suggested Prompts */}
        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-1">
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, index) => (
              <button
                key={index}
                onClick={() => sendSuggestedPrompt(prompt)}
                className="text-xs text-left p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm mb-2">Start a conversation</p>
            <p className="text-xs">Ask questions about your note or get insights</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  
                  {message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2">
                      <button
                        onClick={() => insertMessageToNote(message.message)}
                        className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
                        title="Insert into note"
                      >
                        <Plus className="w-3 h-3" />
                        Insert
                      </button>
                      <button
                        onClick={() => copyMessage(message.message)}
                        className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 mb-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI about this note..."
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* AI Test Helper Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setInput('Summarize this note in 3 sentences.');
              setTimeout(() => sendMessage(), 100);
            }}
            className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            disabled={loading}
            title="Test prompt: Summarize this note in 3 sentences"
          >
            🧠 Summary
          </button>
          <button
            onClick={() => {
              setInput('What are the key takeaways from this note?');
              setTimeout(() => sendMessage(), 100);
            }}
            className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            disabled={loading}
            title="Test prompt: What are the key takeaways from this note?"
          >
            🔍 Key Takeaways
          </button>
          <button
            onClick={() => {
              setInput('Give me 3 deep insights from this note.');
              setTimeout(() => sendMessage(), 100);
            }}
            className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            disabled={loading}
            title="Test prompt: Give me 3 deep insights from this note"
          >
            ✨ Deep Insights
          </button>
        </div>
      </div>
    </div>
  );
}
