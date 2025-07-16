import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { TrendingUp, BarChart3, Flame, Clock, Calendar } from 'lucide-react';
import ProgressChart from '../components/ProgressChart';
import BackButton from '../components/BackButton';

const FILTER_TYPES = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'Book', label: 'Books', icon: '📚' },
  { key: 'Podcast', label: 'Podcasts', icon: '🎧' },
  { key: 'Video', label: 'Videos', icon: '📺' },
  { key: 'Course', label: 'Courses', icon: '🎓' },
  { key: 'Article', label: 'Articles', icon: '📰' },
];

const RANGE_OPTIONS = [
  { key: 'weekly', label: 'Weekly', icon: Calendar },
  { key: 'monthly', label: 'Monthly', icon: Calendar },
  { key: 'yearly', label: 'Yearly', icon: Calendar },
];

function getDateKey(dateStr: string, range: string) {
  const d = new Date(dateStr);
  if (range === 'weekly') return `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 1) / 7)}`;
  if (range === 'monthly') return `${d.getFullYear()}-${d.getMonth() + 1}`;
  if (range === 'yearly') return `${d.getFullYear()}`;
  return d.toISOString().slice(0, 10);
}

function getStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export default function ProgressPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [aiNotes, setAiNotes] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [range, setRange] = useState('weekly');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('resources');
      setResources(stored ? JSON.parse(stored) : []);
      const notes = localStorage.getItem('aiNotes');
      setAiNotes(notes ? JSON.parse(notes) : []);
    }
  }, []);

  // Filtered resources
  const filteredResources = typeFilter === 'all'
    ? resources
    : resources.filter(r => r.type === typeFilter);

  // Group progress by date key
  const progressByDate: Record<string, number> = {};
  filteredResources.forEach(r => {
    if (r.lastActive && r.progress) {
      const key = getDateKey(r.lastActive, range);
      progressByDate[key] = (progressByDate[key] || 0) + r.progress;
    }
  });

  // Streak calculation (days with progress > 0)
  const daysWithProgress = Array.from(new Set(filteredResources.filter(r => r.lastActive && r.progress > 0).map(r => new Date(r.lastActive).toISOString().slice(0, 10))));
  const streak = getStreak(daysWithProgress);

  // Total minutes tracked
  const totalMinutes = filteredResources.reduce((sum, r) => sum + (r.progress || 0), 0);

  const hasData = filteredResources.length > 0 && totalMinutes > 0;

  return (
    <>
      <Head>
        <title>Progress - SmartShelf</title>
        <meta name="description" content="Track your learning progress over time" />
      </Head>
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Progress Overview</h1>
              </div>
              <p className="text-gray-600">Track your learning progress and streaks over time</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="card-gradient">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Total Minutes</h3>
                    <p className="text-gray-600 text-sm">Learning time tracked</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-700 mb-2">{totalMinutes}</div>
                <div className="text-sm text-blue-600">minutes of focused learning</div>
              </div>
            </div>

            <div className="card-gradient">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Current Streak</h3>
                    <p className="text-gray-600 text-sm">Days with progress</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-700 mb-2">{streak}</div>
                <div className="text-sm text-orange-600">
                  {streak > 1 ? 'days in a row' : streak === 1 ? 'day streak' : 'No streak yet'}
                </div>
              </div>
            </div>

            <div className="card-gradient">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resources</h3>
                    <p className="text-gray-600 text-sm">Total tracked items</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">{filteredResources.length}</div>
                <div className="text-sm text-green-600">learning resources</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {/* Range toggles */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              <div className="flex gap-2">
                {RANGE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setRange(opt.key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all text-sm hover:scale-105 active:scale-95 ${
                      range === opt.key 
                        ? 'bg-blue-100 text-blue-700 shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <div className="flex flex-wrap gap-2">
                {FILTER_TYPES.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setTypeFilter(opt.key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all text-sm flex items-center gap-2 hover:scale-105 active:scale-95 ${
                      typeFilter === opt.key 
                        ? 'bg-blue-100 text-blue-700 shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="card-gradient">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Learning Progress Chart</h2>
                    <p className="text-gray-600 text-sm">Visual representation of your learning journey</p>
                  </div>
                </div>
                <ProgressChart data={progressByDate} range={range} hasData={hasData} />
              </div>
            </div>
          </div>

          {/* Motivation Section */}
          {hasData && (
            <div className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
              <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Keep Up the Great Work!</h2>
                    <p className="text-blue-100">Your learning journey is making progress</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">{totalMinutes}</div>
                    <div className="text-blue-100 text-sm">Total Minutes Learned</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">{streak}</div>
                    <div className="text-blue-100 text-sm">Day Learning Streak</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold mb-1">{filteredResources.length}</div>
                    <div className="text-blue-100 text-sm">Resources Tracked</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 