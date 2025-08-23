import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, BookOpen, Save, Sparkles, Search, Loader, ExternalLink } from 'lucide-react';
import BackButton from '../modules/shared/components/BackButton';
import { useUser } from '../modules/auth/hooks/useUser';
import { supabase } from '../modules/database/config/databaseConfig';

const RESOURCE_TYPES = [
  { key: 'book', label: 'Book', emoji: '📚' },
  { key: 'podcast', label: 'Podcast', emoji: '🎧' },
  { key: 'course', label: 'Course', emoji: '🎓' },
  { key: 'video', label: 'Video', emoji: '📺' },
  { key: 'article', label: 'Article', emoji: '📰' },
];

interface GoogleBookResult {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  pageCount?: number;
  publishedDate?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

export default function AddResourcePage() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({
    emoji: '📚',
    type: 'book',
    title: '',
    author: '',
    duration: '',
    progress: '',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef('');

  // Google Books API search
  const searchGoogleBooks = async (query: string, searchType: 'title' | 'isbn' = 'title') => {
    if (!query || query.length < 2) return [];
    
    try {
      setIsSearching(true);
      let searchQuery = query;
      
      if (searchType === 'isbn') {
        searchQuery = `isbn:${query}`;
      } else {
        searchQuery = `intitle:${query}`;
      }
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5&fields=items(volumeInfo(title,authors,description,imageLinks,pageCount,publishedDate,industryIdentifiers))`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search books');
      }
      
      const data = await response.json();
      return data.items?.map((item: any) => item.volumeInfo) || [];
    } catch (error) {
      console.error('Google Books search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search handler
  const handleSearchInput = (value: string) => {
    setForm(prev => ({ ...prev, title: value }));
    
    // Only search for books and if it's a meaningful query
    if (form.type !== 'book' || !value || value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      if (value !== lastQueryRef.current) {
        lastQueryRef.current = value;
        const results = await searchGoogleBooks(value, 'title');
        setSearchResults(results);
        setShowResults(results.length > 0);
      }
    }, 500);
  };

  // Select a book result
  const selectBookResult = (book: GoogleBookResult) => {
    setForm(prev => ({
      ...prev,
      title: book.title,
      author: book.authors ? book.authors.join(', ') : '',
    }));
    setShowResults(false);
    setSearchResults([]);
  };

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Handle title input with search
  const handleTitleChange = (value: string) => {
    handleSearchInput(value);
    setErrors(prev => ({ ...prev, title: '' }));
  };

  // Handle type selection
  const handleTypeSelect = (emoji: string, type: string) => {
    handleChange('emoji', emoji);
    handleChange('type', type);
    // Clear search results when changing type
    setSearchResults([]);
    setShowResults(false);
  };

  // Validation
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.emoji) newErrors.emoji = 'Resource type is required';
    if (!form.type) newErrors.type = 'Type is required';
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }
    if (!form.progress || isNaN(Number(form.progress)) || Number(form.progress) < 0) {
      newErrors.progress = 'Progress must be a non-negative number';
    }
    if (Number(form.progress) > Number(form.duration)) {
      newErrors.progress = 'Progress cannot exceed duration';
    }
    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 1️⃣ **Get the authenticated user**
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("❌ [AddResource] Auth error:", userError);
        alert("Authentication error. Please sign in again.");
        setSubmitting(false);
        return;
      }
      
      if (!user) {
        console.error("❌ [AddResource] User is not authenticated — redirecting to signin");
        alert("You must be signed in to add resources.");
        setSubmitting(false);
        router.push('/signin');
        return;
      }

      // 2️⃣ **Validate the user exists in app_users**
      const { data: appUser, error: appUserErr } = await supabase
        .from("app_users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (appUserErr || !appUser) {
        console.error("APP_USER VALIDATION ERROR:", appUserErr);
        alert("You need a profile to save a resource. Please complete onboarding.");
        setSubmitting(false);
        return;
      }
      console.log("✅ User validated in app_users:", appUser.id);

      // Extract form variables for the insert
      const type = form.type;
      const title = form.title;
      const author = form.author;
      const emoji = form.emoji;
      const duration = Number(form.duration);
      const progress = Number(form.progress);

      // 3️⃣ **Insert learning resource with explicit user_id**
      const { error: insertError } = await supabase.from("learning_resources").insert({
        type,
        title,
        author,
        emoji,
        category_tags: [],
        duration_minutes: duration,
        progress_minutes: progress,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: user.id, // ✅ Required foreign key
      });

      if (insertError) {
        console.error("❌ Failed to insert learning resource:", insertError);
        alert("Failed to save your learning resource. Please try again.");
        setSubmitting(false);
        return;
      }

      console.log("✅ Learning resource saved successfully!");
      alert("✅ Resource saved!");
      router.push('/my-learning');
      
    } catch (err) {
      console.error('Error saving resource:', err);
      alert('Failed to save resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Add Learning Resource - SmartShelf</title>
        <meta name="description" content="Add a new learning resource to your SmartShelf" />
      </Head>
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
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



                  {/* Title with Search */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Title *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.title}
                        onChange={e => handleTitleChange(e.target.value)}
                        className={`input-field ${errors.title ? 'input-field-error' : ''}`}
                        placeholder="Enter the title of your resource"
                        required
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                    {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                    
                    {/* Search Results */}
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((book, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            onClick={() => selectBookResult(book)}
                          >
                            <div className="flex gap-3">
                              {book.imageLinks?.thumbnail && (
                                <img
                                  src={book.imageLinks.thumbnail}
                                  alt={book.title}
                                  className="w-12 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 line-clamp-1">{book.title}</div>
                                {book.authors && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    by {book.authors.join(', ')}
                                  </div>
                                )}
                                {book.publishedDate && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Published: {book.publishedDate}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
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

            {/* Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-gradient animate-fadeIn sticky top-6" style={{ animationDelay: '0.4s' }}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                  
                  {/* Resource Preview */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {form.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {form.title || 'Resource Title'}
                        </div>
                        {form.author && (
                          <div className="text-sm text-gray-600">{form.author}</div>
                        )}
                      </div>
                    </div>
                    
                    {form.duration && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">Progress</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (Number(form.progress) / Number(form.duration)) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {form.progress} / {form.duration} minutes
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tips */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Tips</span>
                    </div>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• For books, try searching by title for auto-fill</li>
                      <li>• Set realistic time estimates</li>
                      <li>• Track your progress regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}