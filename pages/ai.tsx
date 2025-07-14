import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AskBot from '../components/AskBot';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI learning assistant. I can help you with insights from your notes, suggest quiz questions, or recommend what to study next. What would you like to explore?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // This will be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'd be happy to help you with that! However, I need to be connected to your notes database and OpenAI API to provide meaningful insights. Once the backend is set up, I'll be able to analyze your learning notes and provide personalized recommendations.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the key themes from my business notes?",
    "Create a quiz from my marketing insights",
    "What should I study next based on my learning gaps?",
    "Summarize my notes from last week",
    "What are the most important concepts I've learned?"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AI Assistant - SmartShelf</title>
        <meta name="description" content="Ask your AI assistant about your learning notes" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AI Learning Assistant</h1>
            <p className="text-gray-600">Ask questions about your notes and get personalized insights</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Expanded AI Assistant Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="bg-green-100 text-green-700 rounded-lg p-4 font-semibold hover:bg-green-200">Ask Habit Questions</button>
          <button className="bg-blue-100 text-blue-700 rounded-lg p-4 font-semibold hover:bg-blue-200">Get Suggestions</button>
          <button className="bg-gray-100 text-gray-700 rounded-lg p-4 font-semibold hover:bg-gray-200">Website Help</button>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Chat with AI</h2>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <AskBot onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Quick-Access Tips */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 text-blue-900 rounded-lg p-3">💡 What are streaks?</div>
          <div className="bg-blue-50 text-blue-900 rounded-lg p-3">💡 How do I add a new habit?</div>
          <div className="bg-blue-50 text-blue-900 rounded-lg p-3">💡 Tips for building consistency</div>
        </div>

        {/* Suggested Questions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Try asking:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                <span className="text-blue-600 mr-2">💡</span>
                {question}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 