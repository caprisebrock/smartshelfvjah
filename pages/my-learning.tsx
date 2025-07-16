import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BookOpen, Plus, Filter, Grid, List } from 'lucide-react';
import BackButton from '../components/BackButton';

// Resource types and emoji mapping
const RESOURCE_TYPES = [
  { key: 'all', label: 'All', emoji: '✨' },
  { key: 'book', label: 'Books', emoji: '📚' },
  { key: 'podcast', label: 'Podcasts', emoji: '🎧' },
  { key: 'course', label: 'Courses', emoji: '🎓' },
  { key: 'video', label: 'Videos', emoji: '📺' },
  { key: 'article', label: 'Articles', emoji: '📰' },
];

const TYPE_EMOJI = {
  book: '📚',
  podcast: '🎧',
  course: '🎓',
  video: '📺',
  article: '📰',
};

type ResourceTypeKey = keyof typeof TYPE_EMOJI;

interface LearningResource {
  id: string;
  emoji: string;
  type: string;
  title: string;
  author?: string;
  duration: number;
  progress: number;
  categories: string[];
  notification?: string;
  lastActive: string;
}

export default function MyLearningPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  // Load resources from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('resources');
      if (stored) {
        setResources(JSON.parse(stored));
      }
    }
  }, []);

  // Filtering logic
  const filteredResources =
    activeTab === 'all'
      ? resources
      : resources.filter((r) => r.type === activeTab);

  // Group resources by type for grouped view
  const groupedResources = RESOURCE_TYPES.filter(t => t.key !== 'all').map(type => ({
    ...type,
    items: resources.filter(r => r.type === type.key),
  }));

  // Handlers
  const handleCardClick = (id: string) => {
    router.push(`/resource/${id}`);
  };
  const handleAddResource = () => {
    router.push('/add-resource');
  };

  const getProgressColor = (progress: number, duration: number) => {
    const percentage = (progress / duration) * 100;
    if (percentage >= 100) return 'from-green-500 to-green-600';
    if (percentage >= 75) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-gray-400 to-gray-500';
  };

  const ResourceCard = ({ res, index }: { res: LearningResource; index: number }) => (
    <div
      className="card-interactive animate-fadeIn"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        onClick={() => handleCardClick(res.id)}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            {res.emoji}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{res.title}</h3>
            {res.author && (
              <p className="text-gray-600 text-sm mb-2">{res.author}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{res.duration} min</span>
              <span>•</span>
              <span>{res.progress} / {res.duration} min completed</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((res.progress / res.duration) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-gradient-to-r ${getProgressColor(res.progress, res.duration)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, (res.progress / res.duration) * 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Categories */}
        {res.categories && res.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {res.categories.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                {tag}
              </span>
            ))}
            {res.categories.length > 3 && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                +{res.categories.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Last active: {new Date(res.lastActive).toLocaleDateString()}</span>
          <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
            {res.type}
          </div>
        </div>
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Learning - SmartShelf</title>
        <meta name="description" content="Track your books, podcasts, courses, videos, and more" />
      </Head>
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
              </div>
              <p className="text-gray-600">Track your books, podcasts, courses, videos, and more — all in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddResource}
                className="btn-primary group"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPES.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all text-sm flex items-center gap-2 hover:scale-105 active:scale-95 ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700 shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {tab.key !== 'all' && (
                    <span className="ml-1 px-2 py-0.5 bg-white rounded-full text-xs">
                      {resources.filter(r => r.type === tab.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards Grid or Empty State */}
          {filteredResources.length === 0 ? (
            <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No learning resources yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  Start your learning journey by adding your first resource. Track books, podcasts, courses, and more!
                </p>
                <button
                  onClick={handleAddResource}
                  className="btn-primary group"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Resource
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              {/* Stats bar */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      {filteredResources.length}
                    </div>
                    <div className="text-sm text-blue-600">
                      {activeTab === 'all' ? 'Total Resources' : `${RESOURCE_TYPES.find(t => t.key === activeTab)?.label || 'Resources'}`}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      {filteredResources.filter(r => r.progress >= r.duration).length}
                    </div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-700 mb-1">
                      {filteredResources.reduce((sum, r) => sum + r.progress, 0)}
                    </div>
                    <div className="text-sm text-purple-600">Minutes Learned</div>
                  </div>
                </div>
              </div>

              {/* Grouped by type if All tab, else flat grid */}
              {activeTab === 'all' ? (
                groupedResources.map(group => (
                  <div key={group.key} className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl">{group.emoji}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{group.label}</h2>
                        <p className="text-gray-600 text-sm">{group.items.length} resources</p>
                      </div>
                    </div>
                    {group.items.length === 0 ? (
                      <div className="text-gray-400 text-sm mb-4 ml-11 italic">
                        No {group.label.toLowerCase()} yet.
                      </div>
                    ) : (
                      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {group.items.map((res: LearningResource, index: number) => (
                          <ResourceCard key={res.id} res={res} index={index} />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredResources.map((res: LearningResource, index: number) => (
                    <ResourceCard key={res.id} res={res} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 