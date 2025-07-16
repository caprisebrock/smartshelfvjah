import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, BookOpen, Save, Sparkles } from 'lucide-react';
import BackButton from '../components/BackButton';

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
    cover: '', // for Google Books
    description: '', // for Google Books
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef('');

  // Google Books Autofill
  const fetchBookData = async (title: string) => {
    if (title.length < 2) return;
    if (lastQueryRef.current === title) return;
    lastQueryRef.current = title;
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo;
        setForm(prev => ({
          ...prev,
          author: book.authors ? book.authors.join(', ') : prev.author,
          cover: book.imageLinks?.thumbnail || '',
          description: book.description || '',
        }));
      }
    } catch (e) {
      // fail silently
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'title') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchBookData(value);
      }, 500);
    }
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

  const handleTypeSelect = (emoji: string, type: string) => {
    handleChange('emoji', emoji);
    handleChange('type', type);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <Head>
        <title>Add Learning Resource - SmartShelf</title>
        <meta name="description" content="Add a new learning resource to your SmartShelf" />
      </Head>
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Add Learning Resource</h1>
              </div>
              <p className="text-gray-600">Add a new resource to track your learning progress</p>
            </div>
          </div>

          {/* Form */}
          <div className="card-gradient animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Resource Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Resource Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {RESOURCE_TYPES.map(rt => (
                    <button
                      type="button"
                      key={rt.key}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                        form.emoji === rt.emoji 
                          ? 'bg-blue-100 border-blue-300 shadow-lg' 
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                      onClick={() => handleTypeSelect(rt.emoji, rt.key)}
                      aria-label={rt.label}
                    >
                      <div className="text-3xl mb-2">{rt.emoji}</div>
                      <div className="text-sm font-medium text-gray-900">{rt.label}</div>
                    </button>
                  ))}
                </div>
                {errors.emoji && <div className="text-red-500 text-sm mt-2">{errors.emoji}</div>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className={`input-field ${errors.title ? 'input-field-error' : ''}`}
                  placeholder="Enter the title of your resource"
                  required
                />
                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Author / Creator
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => handleChange('author', e.target.value)}
                  className="input-field"
                  placeholder="Author, creator, or instructor name"
                />
              </div>

              {/* Duration & Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Total Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={e => handleChange('duration', e.target.value)}
                    className={`input-field ${errors.duration ? 'input-field-error' : ''}`}
                    placeholder="e.g., 240"
                    required
                  />
                  {errors.duration && <div className="text-red-500 text-sm mt-1">{errors.duration}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Current Progress (minutes) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.progress}
                    onChange={e => handleChange('progress', e.target.value)}
                    className={`input-field ${errors.progress ? 'input-field-error' : ''}`}
                    placeholder="e.g., 45"
                    required
                  />
                  {errors.progress && <div className="text-red-500 text-sm mt-1">{errors.progress}</div>}
                </div>
              </div>

              {/* Category Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.categories.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)} 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input-field flex-1"
                    placeholder="Add a category tag (e.g., Productivity, Business)"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddTag}
                    className="btn-secondary"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Custom Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Custom Category
                </label>
                <input
                  type="text"
                  value={form.otherCategory}
                  onChange={e => handleChange('otherCategory', e.target.value)}
                  className="input-field"
                  placeholder="Enter a custom category"
                />
              </div>

              {/* Notification Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={form.notification}
                  onChange={e => handleChange('notification', e.target.value)}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set a date to remind yourself to continue this resource
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary group"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Add Resource
                      <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 