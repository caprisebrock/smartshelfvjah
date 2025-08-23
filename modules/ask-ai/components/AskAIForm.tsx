// COPY THIS ENTIRE FILE FROM: pages/ask-ai.tsx
import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Bot, Send, Sparkles, RefreshCw, Copy, Save, BookOpen, History, Zap, Clock, MessageSquare } from 'lucide-react';
import BackButton from '../../shared/components/BackButton';

const TONE_OPTIONS = [
  { value: 'Summary', label: 'Summary', icon: '📝', description: 'Concise overview of key points' },
  { value: 'Bullet Points', label: 'Bullet Points', icon: '•', description: 'Structured list format' },
  { value: 'Insightful Takeaways', label: 'Insightful Takeaways', icon: '💡', description: 'Deep understanding and connections' },
  { value: 'Detailed', label: 'Detailed', icon: '📚', description: 'Comprehensive explanation' },
];

const MODEL_OPTIONS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient', badge: 'Standard' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable', badge: 'Premium' },
];

interface AiHistoryEntry {
  id: string;
  prompt: string;
  tone: string;
  model: string;
  quote?: string;
  response: string;
  timestamp: string;
  tokens?: number;
}

interface AiNote {
  id: string;
  title: string;
  content: string;
  tone: string;
  quote?: string;
  date: string;
  resourceId?: string;
}

// Token estimation: ~4 characters per token
function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function AskAIPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Summary');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [quote, setQuote] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<AiHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);
  const [responseTokens, setResponseTokens] = useState<number | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Load settings and history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load AI history
      const savedHistory = localStorage.getItem('aiHistory');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse AI history:', e);
        }
      }

      // Load settings
      const settings = localStorage.getItem('smartSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          if (parsed.enableGPT4 && parsed.enableGPT4 === true) {
            setModel('gpt-4');
          }
        } catch (e) {
          console.error('Failed to parse settings:', e);
        }
      }

      // Load draft prompt from session or other pages
      const draftPrompt = localStorage.getItem('aiDraftPrompt');
      if (draftPrompt) {
        setPrompt(draftPrompt);
        localStorage.removeItem('aiDraftPrompt'); // Clear after loading
      }
    }
  }, []);

  // Update token count when prompt or quote changes
  useEffect(() => {
    const inputText = prompt + (quote ? ` Quote: ${quote}` : '');
    setTokenCount(estimateTokens(inputText));
  }, [prompt, quote]);

  // Scroll to response when it appears
  useEffect(() => {
    if (aiResponse && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiResponse]);

  // Save to localStorage
  const saveToHistory = (entry: AiHistoryEntry) => {
    const newHistory = [entry, ...history].slice(0, 50); // Keep last 50 entries
    setHistory(newHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiHistory', JSON.stringify(newHistory));
    }
  };

  // Handle Ask AI
  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setAIResponse('');
    setError('');
    setResponseTokens(null);
    setCopied(false);

    try {
      const requestBody = {
        question: prompt.trim() + (quote ? `\n\nQuote/Context: ${quote}` : ''),
        model,
        tone,
        conversationHistory: [],
      };

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.response?.response || data.response || '';
      const tokens = data.response?.tokens || data.tokens || null;

      setAIResponse(responseText);
      setResponseTokens(tokens);

      // Save to history
      const historyEntry: AiHistoryEntry = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        tone,
        model,
        quote: quote.trim() || undefined,
        response: responseText,
        timestamp: new Date().toISOString(),
        tokens,
      };
      saveToHistory(historyEntry);

    } catch (err: any) {
      setError(err.message || 'Failed to get AI response. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save as Note
  const handleSaveAsNote = () => {
    if (!aiResponse) return;

    const note: AiNote = {
      id: Date.now().toString(),
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      content: aiResponse,
      tone,
      quote: quote || undefined,
      date: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const existingNotes = JSON.parse(localStorage.getItem('aiNotes') || '[]');
      localStorage.setItem('aiNotes', JSON.stringify([note, ...existingNotes]));
    }

    // Show success feedback
    const originalText = 'Save as Note';
    const button = document.querySelector('[data-save-note]') as HTMLButtonElement;
    if (button) {
      button.textContent = '✅ Saved!';
      setTimeout(() => {
        button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>Save as Note';
      }, 1500);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!aiResponse) return;
    
    try {
      await navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Restore from history
  const handleRestoreHistory = (entry: AiHistoryEntry) => {
    setPrompt(entry.prompt);
    setTone(entry.tone);
    setModel(entry.model);
    setQuote(entry.quote || '');
    setAIResponse(entry.response);
    setResponseTokens(entry.tokens || null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to Resource (stub)
  const handleAddToResource = () => {
    // TODO: Implement resource assignment
    alert('Coming soon: Assign this note to a specific learning resource!');
  };

  // Check if GPT-4 is enabled
  const isGPT4Enabled = () => {
    if (typeof window === 'undefined') return false;
    try {
      const settings = JSON.parse(localStorage.getItem('smartSettings') || '{}');
      return settings.enableGPT4 === true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <Head>
        <title>Ask AI - SmartShelf</title>
        <meta name="description" content="AI-powered learning assistant for SmartShelf" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Learning Assistant</h1>
                  <p className="text-gray-600">Get personalized help with your learning journey</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Chat Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Input Form */}
              <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <form onSubmit={handleAskAI} className="p-8 space-y-6">
                  {/* Main Prompt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      What would you like help understanding?
                    </label>
                    <textarea
                      className="textarea-field min-h-[120px] resize-none"
                      placeholder="Ask me anything about your learning... I can help summarize concepts, explain difficult topics, create study guides, or provide insights on any subject."
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Settings Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tone Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Response Style</label>
                      <div className="space-y-2">
                        {TONE_OPTIONS.map(option => (
                          <label key={option.value} className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer hover:bg-purple-50 hover:border-purple-200" style={{
                            borderColor: tone === option.value ? '#8b5cf6' : '#e5e7eb',
                            backgroundColor: tone === option.value ? '#f3f4f6' : 'white'
                          }}>
                            <input
                              type="radio"
                              name="tone"
                              value={option.value}
                              checked={tone === option.value}
                              onChange={e => setTone(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-xl">{option.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">AI Model</label>
                      <div className="space-y-2">
                        {MODEL_OPTIONS.map(option => (
                          <label key={option.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer hover:bg-blue-50 hover:border-blue-200 ${
                            !isGPT4Enabled() && option.value === 'gpt-4' ? 'opacity-50 cursor-not-allowed' : ''
                          }`} style={{
                            borderColor: model === option.value ? '#3b82f6' : '#e5e7eb',
                            backgroundColor: model === option.value ? '#f3f4f6' : 'white'
                          }}>
                            <input
                              type="radio"
                              name="model"
                              value={option.value}
                              checked={model === option.value}
                              onChange={e => setModel(e.target.value)}
                              disabled={!isGPT4Enabled() && option.value === 'gpt-4'}
                              className="sr-only"
                            />
                            <Zap className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{option.label}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  option.badge === 'Premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {option.badge}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {!isGPT4Enabled() && (
                        <p className="text-sm text-gray-500 mt-2">
                          Enable GPT-4 in <button onClick={() => router.push('/settings')} className="text-blue-600 hover:underline">Settings</button> for premium features
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quote/Context Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Quote or Context <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Paste a quote, excerpt, or provide additional context to help me understand better..."
                      value={quote}
                      onChange={e => setQuote(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Token Counter & Submit */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{tokenCount} tokens</span>
                      </div>
                      {responseTokens && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{responseTokens} response tokens</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="btn-primary group min-w-[140px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Ask AI
                          <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">!</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-red-800 font-medium">Something went wrong</p>
                          <p className="text-red-700 text-sm mt-1">{error}</p>
                          <button
                            onClick={() => handleAskAI()}
                            className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* AI Response */}
              {aiResponse && (
                <div ref={responseRef} className="card-gradient animate-fadeIn">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Response</h3>
                        <p className="text-gray-600 text-sm">
                          {model === 'gpt-4' ? 'GPT-4' : 'GPT-3.5 Turbo'} • {tone} style
                          {responseTokens && ` • ${responseTokens} tokens`}
                        </p>
                      </div>
                    </div>

                    <div className="prose max-w-none text-gray-900 mb-6 whitespace-pre-line leading-relaxed">
                      {aiResponse}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSaveAsNote}
                        data-save-note
                        className="btn-success group"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save as Note
                      </button>
                      <button
                        onClick={handleAddToResource}
                        className="btn-secondary group"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Add to Resource
                      </button>
                      <button
                        onClick={handleCopy}
                        className="btn-secondary group"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Text'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-gradient animate-fadeIn sticky top-6" style={{ animationDelay: '0.4s' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                        <History className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Recent Chats</h3>
                        <p className="text-sm text-gray-500">{history.length} conversations</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowHistory(!showHistory)} 
                      className="btn-ghost text-sm"
                    >
                      {showHistory ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {showHistory && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {history.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm">No conversations yet</p>
                          <p className="text-xs text-gray-400 mt-1">Your AI chats will appear here</p>
                        </div>
                      ) : (
                        history.map((entry) => (
                          <button
                            key={entry.id}
                            className="w-full text-left p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
                            onClick={() => handleRestoreHistory(entry)}
                          >
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-purple-700">{entry.tone}</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                  {entry.model === 'gpt-4' ? 'GPT-4' : 'GPT-3.5'}
                                </span>
                              </div>
                              <span>{timeAgo(new Date(entry.timestamp))}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-700 transition-colors">
                              {entry.prompt}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {entry.response}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 