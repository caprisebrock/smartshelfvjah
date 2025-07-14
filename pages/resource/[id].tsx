import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, X, Play, Pause, CheckCircle } from 'lucide-react';

type ResourceType = 'Book' | 'Podcast' | 'Video' | 'Course' | 'Article';

const formatEmojis: Record<ResourceType, string> = {
  Book: '📚',
  Podcast: '🎧',
  Video: '🎥',
  Course: '💻',
  Article: '📰',
};

const formatColors: Record<ResourceType, string> = {
  Book: 'bg-blue-50',
  Podcast: 'bg-green-50',
  Video: 'bg-purple-50',
  Course: 'bg-orange-50',
  Article: 'bg-gray-100',
};

interface LearningResource {
  id: string;
  type: ResourceType;
  title: string;
  author?: string;
  duration: number;
  progress: number;
  categories: string[];
  otherCategory?: string;
  lastActive: string;
  reminder?: string;
  notes?: string;
}

export default function ResourceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [resource, setResource] = useState<LearningResource | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    duration: '',
    progress: '',
    notes: '',
  });
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInput, setAIInput] = useState('');
  const [aiTone, setAITone] = useState('Summarized');
  const [aiLoading, setAILoading] = useState(false);
  const [aiOutput, setAIOutput] = useState('');
  const [aiError, setAIError] = useState('');

  // Mock data - in a real app, this would come from an API or context
  useEffect(() => {
    if (id) {
      // Mock resource data
      const mockResource: LearningResource = {
        id: id as string,
        type: 'Book',
        title: 'Atomic Habits',
        author: 'James Clear',
        duration: 320,
        progress: 120,
        categories: ['Productivity', 'Self-Improvement'],
        lastActive: new Date().toISOString(),
        notes: 'Focus on the 1% improvements. The compound effect is powerful.',
      };
      setResource(mockResource);
      setEditForm({
        title: mockResource.title,
        author: mockResource.author || '',
        duration: mockResource.duration.toString(),
        progress: mockResource.progress.toString(),
        notes: mockResource.notes || '',
      });
    }
  }, [id]);

  if (!resource) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const getFormatEmoji = (type: ResourceType) => {
    return formatEmojis[type] || '✨';
  };

  const getFormatColor = (type: ResourceType) => {
    return formatColors[type] || 'bg-gray-100';
  };

  const progressPercentage = Math.min(100, (resource.progress / resource.duration) * 100);
  const remainingMinutes = resource.duration - resource.progress;

  const handleSave = () => {
    setResource(prev => prev ? {
      ...prev,
      title: editForm.title,
      author: editForm.author,
      duration: Number(editForm.duration),
      progress: Number(editForm.progress),
      notes: editForm.notes,
    } : null);
    setIsEditing(false);
  };

  const handleProgressUpdate = (increment: number) => {
    const newProgress = Math.min(resource.duration, resource.progress + increment);
    setResource(prev => prev ? { ...prev, progress: newProgress } : null);
    setSessionProgress(prev => prev + increment);
  };

  const handleComplete = () => {
    setResource(prev => prev ? { ...prev, progress: prev.duration } : null);
    setIsPlaying(false);
  };

  // Simulate AI note generation
  const handleGenerateNotes = () => {
    setAILoading(true);
    setAIOutput('');
    setAIError('');
    setTimeout(() => {
      // Fake AI output based on tone
      let output = '';
      switch (aiTone) {
        case 'Summarized':
          output = `Summary: ${aiInput || 'Key ideas and actionable insights from this resource.'}`;
          break;
        case 'Detailed':
          output = `Detailed Notes:\n- ${aiInput || 'Comprehensive breakdown of main points and lessons.'}`;
          break;
        case 'Bullet Points':
          output = `• ${aiInput || 'Main takeaways in bullet form.'}`;
          break;
        case 'Insights':
          output = `Insights: ${aiInput || 'Unique perspectives and personal reflections.'}`;
          break;
        default:
          output = aiInput || 'AI-generated notes.';
      }
      setAILoading(false);
      setAIOutput(output);
    }, 1200);
  };

  // Save AI note to localStorage and route to /notes
  const handleSaveToNotes = () => {
    const note = {
      title: `AI Notes for ${resource.title}`,
      content: aiOutput,
      category: 'other',
      tags: resource.categories || [],
      bookTitle: resource.title,
      isFavorite: false,
    };
    // Save to localStorage for /notes page to pick up (simulate global notes)
    const existing = JSON.parse(localStorage.getItem('aiNotes') || '[]');
    localStorage.setItem('aiNotes', JSON.stringify([note, ...existing]));
    router.push('/notes');
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{resource.title} - SmartShelf</title>
        <meta name="description" content={`Track your progress on ${resource.title}`} />
      </Head>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/my-learning"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Learning
          </Link>
        </div>

        {/* Resource Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className={`text-6xl ${getFormatColor(resource.type)} rounded-2xl w-24 h-24 flex items-center justify-center`}>
              {getFormatEmoji(resource.type)}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="text-3xl font-bold text-gray-900 bg-gray-50 rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                    className="text-lg text-gray-600 bg-gray-50 rounded-lg px-3 py-2 w-full"
                    placeholder="Author"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                  <p className="text-lg text-gray-600">{resource.author}</p>
                </div>
              )}
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{resource.type}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{resource.duration} minutes</span>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isEditing ? 'Save' : 'Edit'}</span>
                </button>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {resource.categories.map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                {cat}
              </span>
            ))}
          </div>

          {/* AI Notes Assistant Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition-colors text-base"
            >
              ✨ Generate Notes with AI
            </button>
            <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isEditing ? 'Save' : 'Edit'}</span>
                </button>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Cancel</span>
                  </button>
                )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{resource.progress} / {resource.duration} minutes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{Math.round(progressPercentage)}% complete</span>
                <span>{remainingMinutes} minutes remaining</span>
              </div>
            </div>

            {/* Session Controls */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session</h3>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Start Session'}
                </button>
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
              </div>
              
              {isPlaying && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Quick progress updates:</p>
                  <div className="flex gap-2">
                    {[5, 10, 15, 30].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => handleProgressUpdate(minutes)}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        +{minutes}m
                      </button>
                    ))}
                  </div>
                  {sessionProgress > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      +{sessionProgress} minutes this session
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Stats</h2>
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Last Active</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(resource.lastActive).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Time Remaining</div>
                <div className="text-lg font-semibold text-gray-900">
                  {remainingMinutes} minutes
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
              {resource.reminder && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Next Reminder</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(resource.reminder).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notes</h2>
          {isEditing ? (
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all min-h-[200px] p-4"
              placeholder="Add your notes and insights here..."
            />
          ) : (
            <div className="prose max-w-none">
              {resource.notes ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {resource.notes}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  No notes yet. Click "Edit" to add your thoughts and insights.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* AI Notes Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 p-0 overflow-hidden flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-purple-50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <span className="text-lg font-bold text-purple-800">AI Learning Notes Assistant</span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-700 text-lg"
                onClick={() => setShowAIModal(false)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-6 px-6 py-8 bg-purple-50">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Paste a summary, quote, or description</label>
                <textarea
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all min-h-[80px]"
                  value={aiInput}
                  onChange={e => setAIInput(e.target.value)}
                  placeholder="E.g. 'Chapter 3: The Power of Habits...'"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all"
                  value={aiTone}
                  onChange={e => setAITone(e.target.value)}
                >
                  <option>Summarized</option>
                  <option>Detailed</option>
                  <option>Bullet Points</option>
                  <option>Insights</option>
                </select>
              </div>
              <button
                onClick={handleGenerateNotes}
                disabled={aiLoading}
                className="w-full rounded-xl bg-purple-500 text-white py-3 text-base font-semibold hover:bg-purple-600 transition-colors disabled:opacity-60 mb-2"
              >
                {aiLoading ? 'Generating...' : 'Generate Notes'}
              </button>
              {aiError && <div className="text-red-500 text-sm">{aiError}</div>}
              {aiOutput && (
                <div className="bg-white rounded-xl shadow p-4 mt-2 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <span className="font-semibold text-purple-700">AI Notes</span>
                  </div>
                  <div className="text-gray-800 whitespace-pre-line text-base">{aiOutput}</div>
                  <button
                    onClick={handleSaveToNotes}
                    className="mt-4 w-full rounded-xl bg-green-500 text-white py-2 text-base font-semibold hover:bg-green-600 transition-colors"
                  >
                    Save to Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 