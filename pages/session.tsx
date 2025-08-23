import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Play, Pause, Square, Bot, Sparkles, Clock, Target, BookOpen, Brain, Zap } from 'lucide-react';
import BackButton from '../modules/shared/components/BackButton';

interface SessionResource {
  id: string;
  title: string;
  author?: string;
  emoji: string;
  type: string;
  progress: number;
  duration: number;
}

interface SessionStats {
  timeSpent: number;
  notesCreated: number;
  aiQuestions: number;
  focusScore: number;
}

const FOCUS_PROMPTS = [
  "Summarize the key concepts you just learned",
  "What are the main takeaways from this session?",
  "How can you apply what you learned today?",
  "What questions do you still have about this topic?",
  "Create a study guide for this material",
  "Explain this concept in simple terms",
  "What connections can you make to other topics?",
  "What would you teach someone else about this?",
];

const MOTIVATIONAL_QUOTES = [
  "Focus is the bridge between where you are and where you want to be.",
  "Deep work is the ability to focus without distraction on a cognitively demanding task.",
  "The successful warrior is the average person with laser-like focus.",
  "Concentration is the secret of strength in politics, in war, in trade, in short in all management.",
  "Where attention goes, energy flows and results show.",
  "The art of being wise is knowing what to overlook.",
  "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
  "Your focus determines your reality.",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function SessionPage() {
  const router = useRouter();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentResource, setCurrentResource] = useState<SessionResource | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Load session data and initialize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load current resource (stub for now)
      const resources = JSON.parse(localStorage.getItem('resources') || '[]');
      if (resources.length > 0) {
        // Get the most recently active resource
        const mostRecent = resources.reduce((latest: any, current: any) => 
          new Date(current.lastActive) > new Date(latest.lastActive) ? current : latest
        );
        setCurrentResource(mostRecent);
      }

      // Set random motivational quote
      setMotivationalQuote(getRandomItem(MOTIVATIONAL_QUOTES));
      setSuggestedPrompt(getRandomItem(FOCUS_PROMPTS));

      // Load saved session notes
      const savedNotes = localStorage.getItem('sessionNotes');
      if (savedNotes) {
        setSessionNotes(savedNotes);
      }
    }
  }, []);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && !isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isPaused]);

  // Save notes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionNotes', sessionNotes);
    }
  }, [sessionNotes]);

  // Start session
  const handleStartSession = () => {
    setIsSessionActive(true);
    setIsPaused(false);
    setSessionTime(0);
    // Generate new quote and prompt for the session
    setMotivationalQuote(getRandomItem(MOTIVATIONAL_QUOTES));
    setSuggestedPrompt(getRandomItem(FOCUS_PROMPTS));
  };

  // Pause/Resume session
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // End session
  const handleEndSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    
    // Generate fake session stats
    const stats: SessionStats = {
      timeSpent: sessionTime,
      notesCreated: sessionNotes.split('\n').filter(line => line.trim()).length,
      aiQuestions: 0, // Would track actual AI interactions
      focusScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
    };

    // Save session to history (stub)
    const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    const newSession = {
      id: Date.now().toString(),
      resource: currentResource,
      stats,
      notes: sessionNotes,
      date: new Date().toISOString(),
    };
    localStorage.setItem('sessionHistory', JSON.stringify([newSession, ...sessionHistory.slice(0, 19)]));

    // Show completion message and redirect
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  // Open AI modal
  const handleAskAI = () => {
    setAiPrompt(sessionNotes ? `${suggestedPrompt}\n\nMy notes:\n${sessionNotes}` : suggestedPrompt);
    setShowAIModal(true);
  };

  // Close AI modal
  const handleCloseAIModal = () => {
    setShowAIModal(false);
    setAiPrompt('');
  };

  // Navigate to full AI assistant
  const handleOpenAIAssistant = () => {
    // Save current prompt to localStorage for the AI page to pick up
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiDraftPrompt', aiPrompt);
    }
    router.push('/ask-ai');
  };

  return (
    <>
      <Head>
        <title>SmartFocus Session - SmartShelf</title>
        <meta name="description" content="Immersive learning session with AI assistance" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white animate-fadeIn">
        {/* Header - Only show back button if not in active session */}
        {!isSessionActive && (
          <div className="absolute top-6 left-6 z-10">
            <BackButton variant="ghost" className="text-white hover:bg-white/10 border-white/20" />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Session Status */}
          <div className="text-center mb-8 animate-slideIn">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">SmartFocus</h1>
                <p className="text-blue-200">Immersive Learning Mode</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <div className="text-6xl font-mono font-bold mb-2">{formatTime(sessionTime)}</div>
              <div className="text-blue-200">
                {isSessionActive ? (isPaused ? 'Session Paused' : 'Session Active') : 'Ready to Focus'}
              </div>
            </div>
          </div>

          {/* Current Resource */}
          {currentResource && (
            <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                    {currentResource.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{currentResource.title}</h3>
                    {currentResource.author && (
                      <p className="text-blue-200">{currentResource.author}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-200">Progress</div>
                    <div className="text-lg font-bold">
                      {Math.round((currentResource.progress / currentResource.duration) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentResource.progress / currentResource.duration) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Quote */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                <h3 className="text-lg font-bold">Focus Inspiration</h3>
              </div>
              <p className="text-lg italic leading-relaxed">&ldquo;{motivationalQuote}&rdquo;</p>
            </div>
          </div>

          {/* Session Controls */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="flex justify-center gap-4">
              {!isSessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <Play className="w-6 h-6 mr-2 inline" />
                  Start Focus Session
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={handlePauseResume}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    {isPaused ? <Play className="w-5 h-5 mr-2 inline" /> : <Pause className="w-5 h-5 mr-2 inline" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={handleEndSession}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Square className="w-5 h-5 mr-2 inline" />
                    End Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Session Notepad */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-300" />
                  <h3 className="text-lg font-bold">Session Notes</h3>
                </div>
                <div className="text-sm text-blue-200">
                  {sessionNotes.split('\n').filter(line => line.trim()).length} lines
                </div>
              </div>
              <textarea
                className="w-full h-40 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                placeholder="Capture your thoughts, insights, and key learnings here..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </div>
          </div>

          {/* AI Assistant */}
          <div className="animate-fadeIn" style={{ animationDelay: '1s' }}>
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-blue-300" />
                <h3 className="text-lg font-bold">AI Learning Assistant</h3>
              </div>
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="text-sm text-blue-200 mb-2">Suggested prompt:</div>
                <div className="text-white italic">&ldquo;{suggestedPrompt}&rdquo;</div>
              </div>
              <button
                onClick={handleAskAI}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Zap className="w-5 h-5 mr-2 inline" />
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>

        {/* AI Modal */}
        {showAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto animate-scaleIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">AI Assistant</h3>
                      <p className="text-gray-600 text-sm">Get help with your learning</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAIModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    What would you like help with?
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                    placeholder="Ask me anything about your learning..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCloseAIModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOpenAIAssistant}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Zap className="w-5 h-5 mr-2 inline" />
                    Open AI Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session End Success */}
        {!isSessionActive && sessionTime > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto animate-scaleIn">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Session Complete!</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-700">{formatTime(sessionTime)}</div>
                    <div className="text-sm text-blue-600">Time Focused</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-700">
                      {sessionNotes.split('\n').filter(line => line.trim()).length}
                    </div>
                    <div className="text-sm text-green-600">Notes Created</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Great work! Your session has been saved to your learning history.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 