import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlusCircle, BookOpen, Clock, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { useUser } from '../modules/auth/hooks/useUser';
import { supabase } from '../modules/database/config/databaseConfig';
import SmartAssistantBanner from '../modules/ai-companion/components/SmartAssistantBanner';
import { useSmartSuggestions } from '../modules/ai-companion/hooks/useSmartSuggestions';

// Learning resource types with beautiful emoji icons
const LEARNING_TYPES = [
  { type: 'Book', emoji: '📚', label: 'Books' },
  { type: 'Podcast', emoji: '🎧', label: 'Podcasts' },
  { type: 'Video', emoji: '🎬', label: 'Videos' },
  { type: 'Article', emoji: '📰', label: 'Articles' },
  { type: 'Course', emoji: '🧠', label: 'Courses' },
] as const;

interface LearningResource {
  id: string;
  user_id: string;
  emoji: string;
  type: string;
  title: string;
  author?: string;
  duration_minutes: number;
  progress_minutes: number;
  category_tags: string[];
  created_at: string;
  updated_at?: string;
}

// Compact Learning Resource Card Component
const LearningResourceCard = ({ resource }: { resource: LearningResource }) => {
  const router = useRouter();
  const progressPercentage = Math.min(100, (resource.progress_minutes / resource.duration_minutes) * 100);
  
  // Get the appropriate emoji for the resource type
  const typeConfig = LEARNING_TYPES.find(t => t.type.toLowerCase() === resource.type.toLowerCase());
  const displayEmoji = typeConfig?.emoji || resource.emoji || '📖';

  const handleCardClick = () => {
    router.push(`/my-learning/${resource.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3 cursor-pointer hover:bg-gray-50 border border-gray-100"
    >
      {/* Main Content: Emoji + Title/Author/Duration Block */}
      <div className="flex items-start gap-3 mb-3">
        {/* Compact Emoji Badge */}
        <div className="bg-slate-100 rounded-xl p-2 flex-shrink-0">
          <span className="text-lg">{displayEmoji}</span>
        </div>
        
        {/* Content Stack */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
            {resource.title}
          </h3>
          
          {/* Author/Type */}
          {resource.author && (
            <p className="text-sm text-gray-600 mb-1">
              by {resource.author}
            </p>
          )}
          
          {/* Duration + Progress Inline */}
          <div className="text-sm text-gray-500">
            {resource.progress_minutes} / {resource.duration_minutes} min
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Tags Row */}
      {resource.category_tags && resource.category_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {resource.category_tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {resource.category_tags.length > 3 && (
            <span className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-gray-500 rounded-full">
              +{resource.category_tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function MyLearningPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { currentSuggestion, dismissSuggestion } = useSmartSuggestions();

  // Load resources from Supabase on mount
  useEffect(() => {
    const loadResources = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('learning_resources')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading resources:', error);
        } else {
          setResources(data || []);
        }
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [user?.id]);

  // Group resources by type
  const groupedResources = LEARNING_TYPES.map(typeConfig => {
    const typeResources = resources.filter(r => 
      r.type.toLowerCase() === typeConfig.type.toLowerCase()
    );
    return {
      ...typeConfig,
      resources: typeResources
    };
  });

  // Calculate dashboard stats
  const totalResources = resources.length;
  const totalMinutes = resources.reduce((sum, r) => sum + r.progress_minutes, 0);
  const completedResources = resources.filter(r => r.progress_minutes >= r.duration_minutes).length;
  const completionRate = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

  if (loading) {
    return (
      <>
        <Head>
          <title>My Learning - SmartShelf</title>
          <meta name="description" content="Your personalized learning dashboard" />
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-48 mb-8"></div>
              <div className="space-y-10">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-32 bg-gray-200 dark:bg-zinc-700 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Learning - SmartShelf</title>
        <meta name="description" content="Your personalized learning dashboard" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back to Dashboard Button */}
          <Link href="/" className="flex items-center text-blue-600 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Learning
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your learning journey across books, podcasts, videos, and more
            </p>
          </div>

          {/* Smart Assistant Banner */}
          {/* ✅ This milestone is generated from real learning_resources in Supabase */}
          {currentSuggestion && (
            <SmartAssistantBanner
              suggestion={currentSuggestion}
              onDismiss={() => dismissSuggestion(currentSuggestion.id)}
            />
          )}

          {/* AI-Powered Overview Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              🧠 AI-Powered Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Resources */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total Resources</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalResources}</div>
              </div>

              {/* Total Minutes */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Minutes Logged</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalMinutes.toLocaleString()}</div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
              </div>

              {/* Smart Insight */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-600">Smart Insight</span>
                </div>
                <div className="text-sm text-gray-700">You&apos;re 42% done with your goal this month!</div>
              </div>
            </div>
          </div>

          {/* Learning Sections */}
          <div className="space-y-10">
            {groupedResources.map(({ type, label, resources: sectionResources }) => (
              <section key={type}>
                {/* Clean Section Header (No Emoji) */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {label}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sectionResources.length} {sectionResources.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Section Content */}
                {sectionResources.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">
                      No {label.toLowerCase()} added yet. Start by adding your first one!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionResources.map((resource) => (
                      <LearningResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* All Learning Resources Section */}
            {resources.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    All My Learning Resources
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {resources.length} total {resources.length === 1 ? 'resource' : 'resources'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {resources
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((resource) => (
                      <LearningResourceCard key={`all-${resource.id}`} resource={resource} />
                    ))}
                </div>
              </section>
            )}

            {/* Global Empty State */}
            {resources.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Start Your Learning Journey
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Add your first learning resource to begin tracking your progress across books, 
                  podcasts, courses, and more.
                </p>
                <Link
                  href="/add-resource"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Your First Resource
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Floating Add Button */}
        {resources.length > 0 && (
          <Link
            href="/add-resource"
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition z-50"
            title="Add new learning resource"
          >
            <PlusCircle className="w-6 h-6" />
          </Link>
        )}
      </div>
    </>
  );
} 