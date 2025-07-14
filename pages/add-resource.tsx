import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const RESOURCE_TYPES = [
  { key: 'book', label: 'Book', emoji: '📚' },
  { key: 'podcast', label: 'Podcast', emoji: '🎧' },
  { key: 'course', label: 'Course', emoji: '🎓' },
  { key: 'video', label: 'Video', emoji: '📺' },
  { key: 'article', label: 'Article', emoji: '📰' },
];

export default function AddResourcePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    emoji: '📚',
    type: 'book',
    title: '',
    author: '',
    duration: '',
    progress: '',
    categories: [] as string[],
    otherCategory: '',
    notification: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.categories.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, categories: [...prev.categories, tagInput.trim()] }));
      setTagInput('');
    }
  };
  const handleRemoveTag = (tag: string) => {
    setForm(prev => ({ ...prev, categories: prev.categories.filter(t => t !== tag) }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.emoji) newErrors.emoji = 'Emoji is required';
    if (!form.type) newErrors.type = 'Type is required';
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0) newErrors.duration = 'Duration required';
    if (!form.progress || isNaN(Number(form.progress)) || Number(form.progress) < 0) newErrors.progress = 'Progress required';
    if (Number(form.progress) > Number(form.duration)) newErrors.progress = 'Progress cannot exceed duration';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    // Save to localStorage
    const resource = {
      id: Date.now().toString(),
      emoji: form.emoji,
      type: form.type,
      title: form.title,
      author: form.author,
      duration: Number(form.duration),
      progress: Number(form.progress),
      categories: [...form.categories, ...(form.otherCategory ? [form.otherCategory] : [])],
      notification: form.notification,
      lastActive: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('resources') || '[]');
    localStorage.setItem('resources', JSON.stringify([resource, ...existing]));
    setTimeout(() => {
      router.push('/my-learning');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <Head>
        <title>Add Resource - SmartShelf</title>
        <meta name="description" content="Add a new learning resource to your SmartShelf" />
      </Head>
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">➕ Add Resource</h1>
        {/* Emoji Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-2 mb-2">
            {RESOURCE_TYPES.map(rt => (
              <button
                type="button"
                key={rt.key}
                className={`text-2xl px-3 py-2 rounded-lg border transition-all ${form.emoji === rt.emoji ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-200 hover:bg-blue-50'}`}
                onClick={() => handleChange('emoji', rt.emoji) || handleChange('type', rt.key)}
                aria-label={rt.label}
              >
                {rt.emoji}
              </button>
            ))}
          </div>
          {errors.emoji && <div className="text-red-500 text-xs mt-1">{errors.emoji}</div>}
        </div>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            required
          />
          {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
        </div>
        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author (optional)</label>
          <input
            type="text"
            value={form.author}
            onChange={e => handleChange('author', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
          />
        </div>
        {/* Duration & Progress */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={e => handleChange('duration', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              required
            />
            {errors.duration && <div className="text-red-500 text-xs mt-1">{errors.duration}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (minutes completed) *</label>
            <input
              type="number"
              min={0}
              value={form.progress}
              onChange={e => handleChange('progress', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              required
            />
            {errors.progress && <div className="text-red-500 text-xs mt-1">{errors.progress}</div>}
          </div>
        </div>
        {/* Category Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.categories.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
              className="flex-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              placeholder="Add tag"
            />
            <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Add</button>
          </div>
          <input
            type="text"
            value={form.otherCategory}
            onChange={e => handleChange('otherCategory', e.target.value)}
            className="w-full mt-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            placeholder="Other (custom category)"
          />
        </div>
        {/* Notification Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notification Date</label>
          <input
            type="date"
            value={form.notification}
            onChange={e => handleChange('notification', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 text-white py-3 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 mt-4"
        >
          {submitting ? 'Saving...' : 'Add Resource'}
        </button>
      </form>
    </div>
  );
} 