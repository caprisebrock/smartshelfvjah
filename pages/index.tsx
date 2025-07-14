import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useHabits } from '../lib/HabitsContext';
import { Target, BookOpen, Sparkles, TrendingUp, Clock, Play } from 'lucide-react';
import Layout from '../components/Layout';
import MotivationalQuote from '../components/MotivationalQuote';

type ResourceType = 'Book' | 'Podcast' | 'Video' | 'Course' | 'Article';

const formatEmojis: Record<ResourceType, string> = {
  Book: '📚',
  Podcast: '🎧',
  Video: '🎥',
  Course: '💻',
  Article: '📰',
};

const motivationalQuotes = [
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

export default function Dashboard() {
  const { state } = useHabits();
  const hasHabits = state.habits.length > 0;

  // Mock learning data - in a real app, this would come from context or API
  const mockLearningData = {
    totalResources: 12,
    completedResources: 3,
    totalMinutes: 1240,
    completedMinutes: 320,
    lastActiveResource: {
      id: '1',
      type: 'Book' as ResourceType,
      title: 'Atomic Habits',
      author: 'James Clear',
      progress: 120,
      duration: 320,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    recentActivity: [
      { type: 'Book', title: 'Deep Work', progress: 45, date: '2024-01-15' },
      { type: 'Podcast', title: 'The Tim Ferriss Show', progress: 60, date: '2024-01-14' },
      { type: 'Video', title: 'React Tutorial', progress: 30, date: '2024-01-13' },
    ]
  };

  const getFormatEmoji = (type: ResourceType) => {
    return formatEmojis[type] || '✨';
  };

  const progressPercentage = Math.min(100, (mockLearningData.completedMinutes / mockLearningData.totalMinutes) * 100);
  const resourceProgressPercentage = Math.min(100, (mockLearningData.completedResources / mockLearningData.totalResources) * 100);

  return (
    <>
      <Head>
        <title>SmartShelf - Dashboard</title>
        <meta name="description" content="Your personal learning and habit tracking dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Section 1: Dashboard Welcome Header */}
            <header className="py-4 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-8 h-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              </div>
              <p className="text-lg text-gray-600">Your overview of today's progress</p>
            </header>

            {/* Section 2: Motivation Quote */}
            <div className="mb-8">
              <MotivationalQuote />
            </div>

            {/* Section 3: Learning Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Learning Stats */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Time Invested</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {mockLearningData.completedMinutes}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">of {mockLearningData.totalMinutes} minutes</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Resources</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {mockLearningData.completedResources}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">of {mockLearningData.totalResources} completed</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${resourceProgressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/my-learning"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                  >
                    <BookOpen className="w-5 h-5" />
                    View All Resources
                  </Link>
                  <Link 
                    href="/my-learning"
                    className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    <Play className="w-5 h-5" />
                    Add New Resource
                  </Link>
                </div>
              </div>

              {/* Last Active Resource */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Last Active</h2>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                      {getFormatEmoji(mockLearningData.lastActiveResource.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {mockLearningData.lastActiveResource.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {mockLearningData.lastActiveResource.author}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{mockLearningData.lastActiveResource.progress} / {mockLearningData.lastActiveResource.duration} min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (mockLearningData.lastActiveResource.progress / mockLearningData.lastActiveResource.duration) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Last active {new Date(mockLearningData.lastActiveResource.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <Link
                    href={`/resource/${mockLearningData.lastActiveResource.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Link>
                </div>
              </div>
            </div>

            {/* Section 4: Empty State Habit Card (if no habits) */}
            {!hasHabits && (
              <div className="max-w-md mx-auto text-center mb-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Start Building Better Habits</h2>
                  <p className="text-gray-600 mb-6">Track what matters to you, one day at a time.</p>
                  <Link 
                    href="/add-habit"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    <Target className="w-5 h-5" />
                    + Add First Habit
                  </Link>
                </div>
              </div>
            )}

            {/* Section 5: Habit Grid (if habits exist) */}
            {hasHabits && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.habits.map((habit) => (
                    <div key={habit.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: habit.color }}
                        >
                          {habit.emoji}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                          <p className="text-sm text-gray-600">
                            {habit.frequency === 'specific-days' && habit.specificDays
                              ? habit.specificDays.join(', ')
                              : habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Today's progress</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-0 h-2 bg-blue-600 rounded-full transition-all duration-300"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Recent Learning Activity */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Recent Learning Activity</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="space-y-4">
                  {mockLearningData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="text-2xl">
                        {getFormatEmoji(activity.type as ResourceType)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.progress} minutes • {activity.date}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </Layout>
    </>
  );
} 