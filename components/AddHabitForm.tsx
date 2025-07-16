import React from 'react';
import { useRouter } from 'next/router';
import { Plus, Target, Sparkles } from 'lucide-react';

export default function AddHabitForm() {
  const router = useRouter();

  const handleAddHabit = () => {
    router.push('/add-habit');
  };

  return (
    <div className="card-gradient group animate-fadeIn">
      <div className="p-8 text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2 w-20 h-20 bg-blue-500 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-purple-500 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          {/* Content */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
              Start Building Better Habits
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
              Create personalized habits with custom emojis, colors, and schedules. 
              Track your progress and build lasting routines.
            </p>
          </div>
          
          {/* Button */}
          <button 
            onClick={handleAddHabit}
            className="btn-primary group/btn mx-auto"
          >
            <Plus className="w-5 h-5 mr-2 transition-transform duration-200 group-hover/btn:rotate-90" /> 
            Add Your First Habit
            <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover/btn:opacity-100 transition-all duration-200" />
          </button>
          
          {/* Subtle decorative elements */}
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse delay-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 