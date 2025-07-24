import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useHabits } from '../lib/HabitsContext';
import { useUser } from '../lib/useUser';
import { useProtectedRoute } from '../lib/useProtectedRoute';
import { useOnboardingGuard } from '../lib/useOnboardingGuard';
import { Target, BookOpen, Sparkles, TrendingUp, Clock, Play, ArrowRight } from 'lucide-react';
import MotivationalQuote from '../components/MotivationalQuote';

type ResourceType = 'Book' | 'Podcast' | 'Video' | 'Course' | 'Article';

const formatEmojis: Record<ResourceType, string> = {
  Book: '📚',
  Podcast: '🎧',
  Video: '🎥',
  Course: '💻',
  Article: '📰',
};

function getFormatEmoji(type: string) {
  return formatEmojis[type as ResourceType] || '✨';
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return date.toLocaleDateString();
}

export default function Dashboard() {
  const { user, loading: authLoading } = useOnboardingGuard();
  const { state } = useHabits();
  const hasHabits = state.habits.length > 0;
  const router = useRouter();
  
  // Check for first habit success
  useEffect(() => {
    if (router.query['first-habit'] === 'success') {
      // Show success message briefly
      setTimeout(() => {
        // Remove the query param
        const { 'first-habit': removed, ...rest } = router.query;
        router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
      }, 3000);
    }
  }, [router]);

  // --- Real Data State ---
  const [resources, setResources] = useState<any[]>([]);
  const [aiNotes, setAiNotes] = useState<any[]>([]);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('resources');
      setResources(stored ? JSON.parse(stored) : []);
      const notes = localStorage.getItem('aiNotes');
      setAiNotes(notes ? JSON.parse(notes) : []);
      const history = localStorage.getItem('aiHistory');
      setAiHistory(history ? JSON.parse(history) : []);
      setLoading(false);
    }
  }, []);

  // --- Learning Progress ---
  const totalTrackedMinutes = resources.reduce((sum, r) => sum + (r.progress || 0), 0);
  const totalDuration = resources.reduce((sum, r) => sum + (r.duration || 0), 0);
  const completedResources = resources.filter(r => r.progress >= r.duration && r.duration > 0).length;
  const progressPercentage = totalDuration > 0 ? Math.min(100, (totalTrackedMinutes / totalDuration) * 100) : 0;
  const resourceProgressPercentage = resources.length > 0 ? Math.min(100, (completedResources / resources.length) * 100) : 0;

  // --- Last Active Resource ---
  const lastActiveResource = resources.length > 0
    ? resources.reduce((latest, r) => !latest || new Date(r.lastActive) > new Date(latest.lastActive) ? r : latest, null)
    : null;

  // --- Recent Learning Activity ---
  const resourceActivity = resources.map(r => ({
    type: r.type,
    emoji: r.emoji,
    title: r.title,
    progress: r.progress,
    date: r.lastActive,
    kind: 'Resource',
  }));
  const noteActivity = aiNotes.map(n => ({
    type: 'Note',
    emoji: n.emoji || '📝',
    title: n.resourceTitle || n.title || 'AI Note',
    progress: undefined,
    date: n.dateSaved || n.date,
    kind: 'Note',
  }));
  const aiActivity = aiHistory.map(h => ({
    type: 'AI',
    emoji: '🤖',
    title: h.prompt ? h.prompt.slice(0, 40) : 'AI Chat',
    progress: undefined,
    date: h.timestamp,
    kind: 'AI',
  }));
  const allActivity = [...resourceActivity, ...noteActivity, ...aiActivity]
    .filter(a => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // --- Empty State Checks ---
  const noResources = resources.length === 0;
  const noActivity = allActivity.length === 0;

  // Show loading screen if redirecting to auth or user not loaded
  if (authLoading || !user) {
    return (
      <>
        <Head>
          <title>SmartShelf - Loading</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">SmartShelf</h1>
            <p className="text-gray-600">Checking authentication...</p>
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>SmartShelf - Dashboard</title>
        <meta name="description" content="Your personal learning and habit tracking dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* First Habit Success Notification */}
      {router.query['first-habit'] === 'success' && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div>
              <div className="font-semibold">Congratulations!</div>
              <div className="text-sm opacity-90">Your first habit has been created successfully!</div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Section 1: Dashboard Welcome Header */}
          <header className="py-6 mb-8 animate-slideIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">Your overview of today&apos;s progress</p>
                {user ? (
                  <p className="text-sm text-gray-500 mt-2">
                    You&apos;re signed in as: <span className="font-semibold text-gray-700">{user.email}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">Loading user...</p>
                )}
              </div>
            </div>
          </header>

          {/* Section 2: Motivation Quote */}
          <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <MotivationalQuote />
          </div>

          {/* Section 3: Learning Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {/* Learning Stats */}
            <div className="lg:col-span-2 card-gradient">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
                    <p className="text-gray-600 text-sm">Track your knowledge journey</p>
                  </div>
                </div>
                {noResources ? (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No resources tracked yet</p>
                    <p className="text-sm mt-2">Start your learning journey by adding your first resource</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Time Invested</h3>
                      </div>
                      <div className="text-3xl font-bold text-blue-700 mb-2">
                        {totalTrackedMinutes}
                      </div>
                      <div className="text-sm text-blue-600 mb-4">of {totalDuration} minutes</div>
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Resources</h3>
                      </div>
                      <div className="text-3xl font-bold text-green-700 mb-2">
                        {completedResources}
                      </div>
                      <div className="text-sm text-green-600 mb-4">of {resources.length} completed</div>
                      <div className="w-full bg-green-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${resourceProgressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons - Centered with proper spacing */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Link 
                    href="/my-learning"
                    className="btn-success group flex-1 sm:flex-none sm:min-w-[200px] justify-center"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    View All Resources
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link 
                    href="/add-resource"
                    className="btn-secondary group flex-1 sm:flex-none sm:min-w-[200px] justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Add New Resource
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Last Active Resource */}
            <div className="card-gradient">
              <div className="p-6 flex flex-col min-h-fit overflow-visible">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Last Active</h2>
                    <p className="text-gray-600 text-sm">Continue where you left off</p>
                  </div>
                </div>
                {lastActiveResource ? (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl bg-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
                        {lastActiveResource.emoji || getFormatEmoji(lastActiveResource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {lastActiveResource.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {lastActiveResource.author}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-purple-600 mb-2">
                        <span>Progress</span>
                        <span>{lastActiveResource.progress} / {lastActiveResource.duration} min</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${Math.min(100, (lastActiveResource.progress / (lastActiveResource.duration || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-600 mb-6">
                      Last active {formatTimeAgo(lastActiveResource.lastActive)}
                    </div>
                    <div className="mt-auto flex justify-center">
                      <Link
                        href={`/resource/${lastActiveResource.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full w-fit flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mx-auto"
                      >
                        <Play className="w-4 h-4" />
                        Resume Learning
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 flex-1">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No resources tracked yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Empty State Habit Card (if no habits) */}
          {!hasHabits && (
            <div className="max-w-lg mx-auto text-center mb-16 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <div className="card-gradient overflow-visible">
                <div className="p-8 flex flex-col items-center min-h-fit">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Building Better Habits</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">Track what matters to you, one day at a time. Create personalized habits and watch your progress grow.</p>
                  <div className="flex justify-center w-full">
                    <Link 
                      href="/add-habit"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full w-fit flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mx-auto group"
                    >
                      <Target className="w-5 h-5" />
                      Add First Habit
                      <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Habit Grid (if habits exist) */}
          {hasHabits && (
            <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
                  <p className="text-gray-600 text-sm">Daily progress tracking</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.habits.map((habit, index) => (
                  <div key={habit.id} className="card-interactive animate-slideIn" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                          style={{ backgroundColor: habit.color }}
                        >
                          {habit.emoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{habit.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {habit.frequency === 'specific-days' && habit.specificDays
                              ? habit.specificDays.join(', ')
                              : habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Today&apos;s progress</span>
                        <div className="w-20 h-3 bg-gray-200 rounded-full">
                          <div className="w-0 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Recent Learning Activity */}
          <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Learning Activity</h2>
                <p className="text-gray-600 text-sm">Your latest progress updates</p>
              </div>
            </div>
            <div className="card-gradient">
              <div className="p-8">
                {noActivity ? (
                  <div className="text-center text-gray-500 py-8">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No learning activity yet</p>
                    <p className="text-sm mt-2">Add your first resource to begin tracking your progress</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="text-3xl">{activity.emoji}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-600">
                            {activity.progress !== undefined ? `${activity.progress} minutes • ` : ''}
                            {formatTimeAgo(activity.date)}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {activity.kind}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 