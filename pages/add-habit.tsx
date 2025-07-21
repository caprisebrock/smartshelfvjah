import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import EmojiPicker from 'emoji-picker-react';
import { useHabits } from '../lib/HabitsContext';
import { Smile, Palette } from 'lucide-react';

const presetColors = [
  { name: 'Blue', value: '#2563eb', class: 'bg-blue-600' },
  { name: 'Green', value: '#10b981', class: 'bg-green-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AddHabitPage() {
  const router = useRouter();
  const { dispatch } = useHabits();
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const habitData = {
      name: formData.name.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      frequency: formData.frequency,
      specificDays: formData.frequency === 'specific-days' ? formData.specificDays : undefined
    };

    console.log('Adding habit:', habitData);

    dispatch({
      type: 'ADD_HABIT',
      payload: habitData
    });

    router.push('/');
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
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton to="/" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smile className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Habit</h1>
              </div>
              <p className="text-gray-600">Create a habit that inspires you to grow</p>
            </div>
          </div>

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
                    className={`w-full px-4 py-3 text-lg border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 ease-in-out ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="e.g. Read 10 pages, Exercise, Drink water"
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
                      className={`w-16 h-16 border-2 rounded-lg shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 ease-in-out hover:scale-105 flex items-center justify-center ${
                        errors.emoji ? 'border-red-500' : 'border-gray-200'
                      } ${selectedEmoji ? 'bg-gray-50' : 'bg-white'}`}
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
                        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ease-in-out hover:scale-110 hover:ring-2 hover:ring-blue-300 ${
                          selectedColor === color.value 
                            ? 'border-gray-800 scale-110 shadow-lg ring-2 ring-blue-500' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                    
                    {/* Custom Color Wheel */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 ease-in-out hover:scale-110 hover:ring-2 hover:ring-blue-300 ${
                          showColorPicker ? 'border-blue-500 bg-blue-50' : 'border-gray-400 hover:border-gray-600'
                        }`}
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
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 transition-all duration-200 ease-in-out"
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
                                ? 'bg-blue-100 text-blue-800 shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
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
                    disabled={!isFormValid}
                    className="mt-6 w-full rounded-xl bg-blue-500 text-white py-3 text-base font-semibold hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    Add Habit
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
                {isFormValid && (
                  <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium text-center">
                      ✨ All set! Your habit is ready to be created.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 