import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BackButton from '../../components/BackButton';
import EmojiPicker from 'emoji-picker-react';
import { useHabits } from '../../lib/HabitsContext';
import { useUser } from '../../lib/useUser';
import { supabase } from '../../lib/supabaseClient';
import { Smile, Palette, Target } from 'lucide-react';

const presetColors = [
  { name: 'Blue', value: '#2563eb', class: 'bg-blue-600' },
  { name: 'Green', value: '#10b981', class: 'bg-green-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function FirstHabitPage() {
  const router = useRouter();
  const { dispatch } = useHabits();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'specific-days' | 'once',
    specificDays: [] as string[]
  });
  
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [selectedColor, setSelectedColor] = useState(presetColors[0].value);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#6366f1');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    }
    
    if (!selectedEmoji) {
      newErrors.emoji = 'Please select an emoji';
    }
    
    if (formData.frequency === 'specific-days' && formData.specificDays.length === 0) {
      newErrors.specificDays = 'Please select at least one day';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields are completed
    if (!formData.name.trim() || !selectedEmoji || !selectedColor) {
      alert("Please complete all fields.");
      return;
    }
    
    // Additional validation for specific days
    if (formData.frequency === 'specific-days' && formData.specificDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Get authenticated user directly from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ [OnboardingFirstHabit] Auth error:', userError);
        alert("Authentication error. Please sign in again.");
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.error('❌ [OnboardingFirstHabit] User is not authenticated — redirecting to signin');
        alert("You must be signed in to create your first habit.");
        setLoading(false);
        router.push('/signin');
        return;
      }

      console.log("🧠 User loaded:", user);

      const habitPayload = {
        user_id: user.id,
        name: formData.name?.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
        frequency: formData.frequency,
        specific_days: formData.frequency === 'specific-days' ? formData.specificDays : null
      };

      console.log("📤 Inserting habit:", habitPayload);

      // Insert habit into Supabase
      const { error, data } = await supabase
        .from("habits")
        .insert([habitPayload]);

      console.log("📥 Insert result:", { error, data });

      if (error) {
        alert("❌ Failed to save habit: " + error.message);
        return;
      }

      // Add to local context for immediate UI update
      if (dispatch) {
        dispatch({
          type: 'ADD_HABIT',
          payload: {
            name: habitPayload.name,
            emoji: habitPayload.emoji,
            color: habitPayload.color,
            frequency: habitPayload.frequency,
            specificDays: habitPayload.specific_days || undefined
          }
        });
      }

      alert("✅ Habit saved!");
      router.push("/");

    } catch (err) {
      console.error('Error creating habit:', err);
      alert("❌ Failed to save habit: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      specificDays: prev.specificDays.includes(day)
        ? prev.specificDays.filter(d => d !== day)
        : [...prev.specificDays, day]
    }));
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setSelectedColor(color);
  };

  const getFrequencyText = () => {
    switch (formData.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'specific-days':
        return formData.specificDays.length > 0 
          ? `${formData.specificDays.join(', ')}`
          : 'Select days';
      case 'once':
        return 'Once';
      default:
        return '';
    }
  };

  const isFormValid = formData.name.trim() && selectedEmoji && selectedColor;

  return (
    <>
      <Head>
        <title>Add Your First Habit - SmartShelf</title>
      </Head>
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton to="/onboarding/step2" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">🎯 Add Your First Habit!</h1>
              </div>
              <p className="text-gray-600">Start strong by setting your first intention</p>
            </div>
          </div>

          {/* Error Display */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Main Content - 2 Column Flex Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column - Form */}
            <div className="lg:w-96 lg:flex-shrink-0">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Habit Name Input */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 text-lg border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 ease-in-out ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="e.g. Read 10 pages, Exercise, Drink water"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Emoji Picker */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Pick an Emoji *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`w-16 h-16 border-2 rounded-lg shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all duration-200 ease-in-out hover:scale-105 flex items-center justify-center ${
                        errors.emoji ? 'border-red-500' : 'border-gray-200'
                      } ${selectedEmoji ? 'bg-gray-50' : 'bg-white'}`}
                      disabled={loading}
                    >
                      {selectedEmoji || <Smile className="w-8 h-8 text-gray-400" />}
                    </button>
                    
                    {errors.emoji && (
                      <p className="mt-2 text-sm text-red-600">{errors.emoji}</p>
                    )}
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="mt-4 relative z-50">
                      <div className="absolute top-0 left-0 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 p-4">
                        <EmojiPicker onEmojiClick={handleEmojiSelect} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pick a Color */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Pick a Color *
                  </label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Preset Colors */}
                    {presetColors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ease-in-out hover:scale-110 hover:ring-2 hover:ring-emerald-300 ${
                          selectedColor === color.value 
                            ? 'border-gray-800 scale-110 shadow-lg ring-2 ring-emerald-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        disabled={loading}
                      />
                    ))}
                    
                    {/* Custom Color Wheel */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 ease-in-out hover:scale-110 hover:ring-2 hover:ring-emerald-300 ${
                          showColorPicker ? 'border-emerald-500 bg-emerald-50' : 'border-gray-400 hover:border-gray-600'
                        }`}
                        disabled={loading}
                      >
                        <Palette size={20} />
                      </button>
                      
                      {/* Color Wheel Modal */}
                      {showColorPicker && (
                        <div className="absolute top-14 left-0 z-30 w-64 h-64 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl ring-1 ring-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Custom Color</span>
                            <button
                              type="button"
                              onClick={() => setShowColorPicker(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => handleCustomColorChange(e.target.value)}
                            className="w-full h-12 rounded-lg border border-gray-200 cursor-pointer"
                            disabled={loading}
                          />
                          <div className="mt-2 text-sm text-gray-500">
                            {customColor}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Frequency Options */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Frequency *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'specific-days', label: 'Specific Days' },
                      { value: 'once', label: 'Once' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="frequency"
                          value={option.value}
                          checked={formData.frequency === option.value}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            frequency: e.target.value as any,
                            specificDays: e.target.value === 'specific-days' ? prev.specificDays : []
                          }))}
                          className="w-5 h-5 text-emerald-600 border-gray-300 focus:ring-emerald-500 transition-all duration-200 ease-in-out"
                          disabled={loading}
                        />
                        <span className="ml-3 text-lg text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Specific Days Selection */}
                  {formData.frequency === 'specific-days' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select days:</p>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 ${
                              formData.specificDays.includes(day)
                                ? 'bg-emerald-100 text-emerald-800 shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                            disabled={loading}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      {errors.specificDays && (
                        <p className="mt-2 text-sm text-red-600">{errors.specificDays}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 text-base font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Add Habit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Live Preview Panel */}
            <div className="lg:flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Live Preview</h3>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] sm:min-h-[500px]">
                {/* Giant Preview Circle */}
                <div 
                  className={`w-52 h-52 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full flex items-center justify-center shadow-2xl ring-1 ring-gray-200 transition-transform duration-200 hover:scale-105 ${
                    selectedEmoji ? 'scale-100' : 'scale-95 opacity-50'
                  }`}
                  style={{ backgroundColor: selectedColor }}
                >
                  {selectedEmoji && (
                    <span className="text-5xl sm:text-6xl lg:text-8xl">{selectedEmoji}</span>
                  )}
                </div>

                {/* Habit Details */}
                <div className="mt-8 text-center space-y-2">
                  <h4 className={`text-xl sm:text-2xl font-bold transition-all duration-200 ease-in-out ${
                    formData.name ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {formData.name || 'Your habit name'}
                  </h4>
                  <p className={`text-base sm:text-lg transition-all duration-200 ease-in-out ${
                    getFrequencyText() ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {getFrequencyText() || 'Frequency'}
                  </p>
                </div>

                {/* Completion Status */}
                {isFormValid && !loading && (
                  <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-800 font-medium text-center">
                      ✨ All set! Your first habit is ready to be created.
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 font-medium text-center">
                      🚀 Creating your first habit...
                    </p>
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