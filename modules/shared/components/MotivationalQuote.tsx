// COPY THIS ENTIRE FILE FROM: components/MotivationalQuote.tsx
// Move the complete contents of components/MotivationalQuote.tsx into this file 
import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const defaultQuotes = [
  "Small actions every day lead to big change.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "It always seems impossible until it's done.",
  "The journey of a thousand miles begins with one step.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "The difference between ordinary and extraordinary is that little extra."
];

function getAllQuotes(): string[] {
  if (typeof window === 'undefined') return defaultQuotes;
  const customQuotes = JSON.parse(localStorage.getItem('customQuotes') || '[]');
  return [...defaultQuotes, ...customQuotes];
}

export default function MotivationalQuote() {
  const [hasMounted, setHasMounted] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = () => {
    const allQuotes = getAllQuotes();
    const random = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[random];
  };

  const refreshQuote = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for better UX
    setQuote(getRandomQuote());
    setIsRefreshing(false);
  };

  useEffect(() => {
    setHasMounted(true);
    setQuote(getRandomQuote());
  }, []);

  if (!hasMounted || !quote) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="h-16 bg-white/20 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce-gentle" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Daily Motivation</h2>
              <p className="text-blue-100 text-sm opacity-90">Fuel your learning journey</p>
            </div>
          </div>
          
          <button
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="p-2 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Get new quote"
          >
            <RefreshCw className={`w-5 h-5 text-white transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute -left-2 -top-2 text-6xl text-white/20 font-serif">&quot;</div>
          <p className={`text-xl font-medium leading-relaxed pl-8 transition-all duration-300 ${isRefreshing ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
            {quote}
          </p>
          <div className="absolute -right-2 -bottom-2 text-6xl text-white/20 font-serif">&quot;</div>
        </div>
        
        {/* Subtle animation indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 