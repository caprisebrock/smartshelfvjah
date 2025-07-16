import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MOTIVATIONAL_TIPS = [
  'Stay focused and take short breaks!',
  'Remember your goals and keep going!',
  'Small steps every day lead to big results.',
  'Reflect on what you learn as you go.',
  'Celebrate your progress, not just the finish line!'
];

const TONE_OPTIONS = [
  { value: 'Summary', label: '📝 Summary' },
  { value: 'Detailed', label: '📚 Detailed' },
  { value: 'Bullet Points', label: '• Bullet Points' },
  { value: 'Insights', label: '💡 Insights' },
];

function getRandomTip() {
  return MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)];
}

export default function SessionPage() {
  const router = useRouter();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState('Summary');
  const [tip, setTip] = useState(getRandomTip());
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load resources from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('resources');
      if (stored) setResources(JSON.parse(stored));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // End session and log
  const handleEndSession = () => {
    if (!selectedResource) return;
    const session = {
      id: Date.now().toString(),
      resourceId: selectedResource.id,
      resourceTitle: selectedResource.title,
      emoji: selectedResource.emoji,
      notes,
      tone,
      duration: timer,
      date: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('learningSessions') || '[]');
    localStorage.setItem('learningSessions', JSON.stringify([session, ...existing]));
    router.push('/my-learning');
  };

  // Select resource (first by default)
  useEffect(() => {
    if (resources.length > 0 && !selectedResource) {
      setSelectedResource(resources[0]);
    }
  }, [resources, selectedResource]);

  // Motivational tip refresh
  const handleNewTip = () => setTip(getRandomTip());

  // Timer display
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Navigation
  const handleBack = () => router.push('/my-learning');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center px-4 py-8 relative">
      <Head>
        <title>SmartFocus Session - SmartShelf</title>
        <meta name="description" content="Immersive study session mode" />
      </Head>
      <div className="absolute left-0 top-0 p-4 z-10">
        <button onClick={handleBack} className="text-blue-600 font-medium hover:underline text-sm">← Back</button>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-8 mt-12 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">SmartFocus Session</h1>
        {selectedResource ? (
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="text-5xl">{selectedResource.emoji}</div>
            <div className="text-xl font-semibold text-gray-900">{selectedResource.title}</div>
          </div>
        ) : (
          <div className="text-gray-500 text-center">No resource selected. Add a resource to start a session.</div>
        )}
        {/* Motivational Quote/Tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3 justify-between">
          <span className="text-blue-700 font-medium">{tip}</span>
          <button onClick={handleNewTip} className="text-xs text-blue-500 underline ml-2">New Tip</button>
        </div>
        {/* Timer */}
        <div className="flex items-center gap-3 justify-center">
          <span className="text-gray-600">Session Time:</span>
          <span className="font-mono text-lg text-purple-700">{formatTime(timer)}</span>
          <button onClick={() => setRunning(r => !r)} className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300">{running ? 'Pause' : 'Resume'}</button>
        </div>
        {/* Notes Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Notes</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 p-3 min-h-[100px]"
            placeholder="Write your notes, thoughts, or key takeaways here..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        {/* Tone Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
          <select
            className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 p-2"
            value={tone}
            onChange={e => setTone(e.target.value)}
          >
            {TONE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          className="w-full rounded-xl bg-purple-600 text-white py-3 text-base font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 mt-2"
          onClick={handleEndSession}
          disabled={!selectedResource}
        >
          End Session
        </button>
      </div>
    </div>
  );
} 