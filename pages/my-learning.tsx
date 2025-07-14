import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Resource types and emoji mapping
const RESOURCE_TYPES = [
  { key: 'all', label: 'All', emoji: '✨' },
  { key: 'book', label: 'Books', emoji: '📖' },
  { key: 'podcast', label: 'Podcasts', emoji: '🎧' },
  { key: 'course', label: 'Courses', emoji: '💻' },
  { key: 'video', label: 'Videos', emoji: '📺' },
  { key: 'article', label: 'Articles', emoji: '📰' },
];

const TYPE_EMOJI = {
  book: '📖',
  podcast: '🎧',
  course: '💻',
  video: '📺',
  article: '📰',
};

type ResourceTypeKey = keyof typeof TYPE_EMOJI;

interface LearningResource {
  id: string;
  type: ResourceTypeKey;
  title: string;
  duration: number;
  progress: number;
  tags: string[];
  lastActive: string;
}

// Example categories for tags (user-defined in real app)
const exampleTags = [
  'Mindset', 'Productivity', 'Business', 'Leadership', 'Focus', 'Marketing', 'Creativity', 'Wellness',
];

// Example resource data (empty by default, can add demo if needed)
const initialResources: LearningResource[] = [];

function formatLastActive(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Last active: today';
  if (diff === 1) return 'Last active: 1 day ago';
  return `Last active: ${diff} days ago`;
}

export default function MyLearningPage() {
  const [resources, setResources] = useState<LearningResource[]>(initialResources);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

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
  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>My Learning - SmartShelf</title>
        <meta name="description" content="Track your books, podcasts, courses, videos, and more" />
      </Head>
      <div className="max-w-3xl mx-auto px-4 py-8 relative">
        {/* Top bar: Back, Title, Add, Close */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-blue-600 font-medium hover:underline text-sm">← Back to Dashboard</Link>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-900 text-center">My Learning</h1>
            <p className="text-base text-gray-600 text-center mt-1">Track your books, podcasts, courses, videos, and more — all in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddResource}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors text-sm"
            >
              + Add Resource
            </button>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="ml-2 text-gray-400 hover:text-gray-700 text-xl p-2 rounded-full transition-colors"
            >
              ❌
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {RESOURCE_TYPES.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm flex items-center gap-2
                ${activeTab === tab.key
                  ? 'bg-blue-100 text-blue-700 shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Resource Cards Grid or Empty State */}
        {filteredResources.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl shadow p-12 text-center text-gray-500 text-lg mt-16">
            No learning resources yet. Click <span className="text-blue-600 font-semibold">Add Resource</span> to get started.
          </div>
        ) : (
          <div>
            {/* Grouped by type if All tab, else flat grid */}
            {activeTab === 'all' ? (
              groupedResources.map(group => (
                <div key={group.key} className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{group.emoji}</span>
                    <span className="text-lg font-semibold text-gray-800">{group.label}</span>
                  </div>
                  {group.items.length === 0 ? (
                    <div className="text-gray-400 text-sm mb-4 ml-8">No {group.label.toLowerCase()} yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {group.items.map((res: LearningResource) => (
                        <button
                          key={res.id}
                          onClick={() => handleCardClick(res.id)}
                          className="w-full text-left bg-white rounded-xl shadow hover:shadow-lg transition-all p-5 flex flex-col gap-3 border border-gray-100 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{TYPE_EMOJI[res.type]}</span>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-lg truncate">{res.title}</div>
                              <div className="text-gray-500 text-xs mt-0.5">{res.duration} min • {res.progress} / {res.duration} min</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {res.tags && res.tags.map((tag: string) => (
                              <span key={tag} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">{formatLastActive(res.lastActive)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredResources.map((res: LearningResource) => (
                  <button
                    key={res.id}
                    onClick={() => handleCardClick(res.id)}
                    className="w-full text-left bg-white rounded-xl shadow hover:shadow-lg transition-all p-5 flex flex-col gap-3 border border-gray-100 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{TYPE_EMOJI[res.type]}</span>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg truncate">{res.title}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{res.duration} min • {res.progress} / {res.duration} min</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {res.tags && res.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{formatLastActive(res.lastActive)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 