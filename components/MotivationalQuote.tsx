import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    setHasMounted(true);
    const allQuotes = getAllQuotes();
    const random = Math.floor(Math.random() * allQuotes.length);
    setQuote(allQuotes[random]);
  }, []);

  if (!hasMounted || !quote) {
    return <div style={{ minHeight: 48 }} />; // Prevent layout shift
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-block text-yellow-300 text-2xl">✨</span>
        <h2 className="text-2xl font-bold">Daily Motivation</h2>
      </div>
      <p className="text-xl font-medium italic leading-relaxed">
        "{quote}"
      </p>
    </div>
  );
} 