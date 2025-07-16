import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Bot, Send, Sparkles, RefreshCw, Copy, Save, BookOpen, History } from 'lucide-react';
import BackButton from '../components/BackButton';

const TONE_OPTIONS = [
  { value: 'Summary', label: '📝 Summary', description: 'Concise overview' },
  { value: 'Detailed', label: '📚 Detailed', description: 'In-depth analysis' },
  { value: 'Bullet Points', label: '• Bullet Points', description: 'Key takeaways' },
  { value: 'Insights', label: '💡 Insights', description: 'Deep understanding' },
];

const MODEL_OPTIONS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable' },
];

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function timeAgo(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
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
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [tokenUsage, setTokenUsage] = useState(estimateTokens(''));
  const [aiTokens, setAiTokens] = useState<number|null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Load history and model toggle from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const h = localStorage.getItem('aiHistory');
      if (h) setHistory(JSON.parse(h));
      const gpt4 = localStorage.getItem('enableGPT4');
      if (gpt4 === 'true') {
        setModel('gpt-4');
      }
    }
  }, []);

  // Update token usage estimate
  useEffect(() => {
    setTokenUsage(estimateTokens(prompt + ' ' + quote));
  }, [prompt, quote]);

  // Scroll to response when shown
  useEffect(() => {
    if (aiResponse && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiResponse]);

  // Save history to localStorage
  const saveHistory = (entry: any) => {
    if (typeof window === 'undefined') return;
    const newHistory = [entry, ...history].slice(0, 20); // max 20 entries
    setHistory(newHistory);
    localStorage.setItem('aiHistory', JSON.stringify(newHistory));
  };

  // Handle Ask AI
  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    setAIResponse('');
    setEditMode(false);
    setCopied(false);
    setError('');
    setAiTokens(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prompt.trim() + (quote ? `\nQuote: ${quote}` : ''),
          model,
          tone,
          conversationHistory: [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || 'Failed to get AI response.');
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setAIResponse(data.response?.response || data.response || '');
      setEditText(data.response?.response || data.response || '');
      setAiTokens(data.response?.tokens || null);
      saveHistory({
        prompt: prompt.trim(),
        tone,
        model,
        quote: quote.trim(),
        response: data.response?.response || data.response || '',
        tokens: data.response?.tokens || null,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to get AI response.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save to Notes
  const handleSaveToNotes = () => {
    if (typeof window === 'undefined') return;
    const note = {
      id: Date.now().toString(),
      title: prompt.slice(0, 40) || 'AI Note',
      content: editMode ? editText : aiResponse,
      tone,
      quote,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('aiNotes') || '[]');
    localStorage.setItem('aiNotes', JSON.stringify([note, ...existing]));
    router.push('/notes');
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editMode ? editText : aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // Restore from history
  const handleRestoreHistory = (entry: any) => {
    setPrompt(entry.prompt);
    setTone(entry.tone);
    setModel(entry.model || 'gpt-3.5-turbo');
    setQuote(entry.quote || '');
    setAIResponse(entry.response);
    setEditText(entry.response);
    setEditMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retry
  const handleRetry = () => handleAskAI();

  // Add to Resource (stub)
  const handleAddToResource = () => {
    alert('This feature is coming soon!');
  };

  // GPT-4 toggle (if enabled in localStorage)
  const gpt4Enabled = typeof window !== 'undefined' && localStorage.getItem('enableGPT4') === 'true';

  return (
    <>
      <Head>
        <title>Ask AI - SmartShelf</title>
        <meta name="description" content="SmartShelf Companion Assistant" />
      </Head>
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Ask AI</h1>
              </div>
              <p className="text-gray-600">Get help with your learning from AI assistant</p>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Chat Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <form onSubmit={handleAskAI} className="p-8 space-y-6">
                  {/* Prompt Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      What would you like help with?
                    </label>
                    <textarea
                      className="textarea-field min-h-[120px]"
                      placeholder="Ask me anything about your learning, request summaries, explanations, or insights..."
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Settings Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Response Style</label>
                      <select
                        className="select-field"
                        value={tone}
                        onChange={e => setTone(e.target.value)}
                        disabled={isLoading}
                      >
                        {TONE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} - {opt.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">AI Model</label>
                      <select
                        className="select-field"
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        disabled={isLoading || (!gpt4Enabled && model === 'gpt-4')}
                      >
                        {MODEL_OPTIONS.filter(opt => opt.value !== 'gpt-4' || gpt4Enabled).map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} - {opt.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quote Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Quote or Context (Optional)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Paste a quote, excerpt, or provide additional context..."
                      value={quote}
                      onChange={e => setQuote(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Token Usage */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Estimated input tokens: ~{tokenUsage}</span>
                    {aiTokens !== null && (
                      <span>Output tokens: {aiTokens}</span>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">
                      <div className="flex items-center justify-between">
                        <span>{error}</span>
                        <button 
                          onClick={handleRetry} 
                          className="btn-ghost text-red-600 hover:text-red-800"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-primary w-full group"
                    disabled={isLoading || !prompt.trim()}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        AI is thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Ask AI
                        <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* AI Response */}
              {aiResponse && (
                <div ref={responseRef} className="card-gradient animate-fadeIn">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Response</h3>
                        <p className="text-gray-600 text-sm">Generated with {model} in {tone} style</p>
                      </div>
                    </div>

                    {editMode ? (
                      <textarea
                        className="textarea-field min-h-[200px] mb-6"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                      />
                    ) : (
                      <div className="prose max-w-none text-gray-900 mb-6 whitespace-pre-line leading-relaxed">
                        {aiResponse}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setEditMode(e => !e)}
                        className="btn-secondary group"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {editMode ? 'Cancel Edit' : 'Edit Response'}
                      </button>
                      <button
                        onClick={handleSaveToNotes}
                        className="btn-success group"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save to Notes
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
              <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                        <History className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Chats</h3>
                    </div>
                    <button 
                      onClick={() => setShowHistory(h => !h)} 
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
                          <p className="text-sm">No recent chats yet</p>
                          <p className="text-xs text-gray-400 mt-1">Your AI conversations will appear here</p>
                        </div>
                      ) : (
                        history.map((entry, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                            onClick={() => handleRestoreHistory(entry)}
                          >
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span className="font-medium text-blue-700">{entry.tone}</span>
                              <span>{timeAgo(new Date(entry.timestamp))}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
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