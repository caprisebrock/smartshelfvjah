import React, { useState } from 'react';
import { X, Brain, ArrowLeft } from 'lucide-react';
import { insertLearningPlan } from '../../../supabase/learning-plans/insertLearningPlan';
import { LearningPlanInput, Milestone } from '../../learning-resources/types/learningPlan.types';
import { useToast } from '../../shared/context/ToastContext';
import { useRouter } from 'next/router';

interface LearningResource {
  id: string;
  title: string;
  duration_minutes: number;
  progress_minutes: number;
  type: string;
}

interface MilestoneGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: LearningResource;
}

export default function MilestoneGeneratorModal({ isOpen, onClose, resource }: MilestoneGeneratorModalProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form');
  const [days, setDays] = useState(7);
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [milestones, setMilestones] = useState<string>('');

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      // Prevent scrolling on multiple levels for better browser support
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Function to parse milestones text into structured format for better display
  const parseMilestones = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const days: { title: string; tasks: string[] }[] = [];
    let currentDay: { title: string; tasks: string[] } | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      // Check if this is a day header (e.g., "Day 1:", "**Day 1**", etc.)
      const dayMatch = trimmed.match(/^(?:\*{0,2})?(?:Day\s+)?(\d+)[\s:]*(?:\*{0,2})?/i);
      
      if (dayMatch) {
        // Save previous day if it exists
        if (currentDay) {
          days.push(currentDay);
        }
        // Start new day
        currentDay = {
          title: `Day ${dayMatch[1]}`,
          tasks: []
        };
      } else if (currentDay && trimmed) {
        // Add task to current day (remove bullets and clean up)
        const cleanTask = trimmed.replace(/^[-•*]\s*/, '').trim();
        if (cleanTask) {
          currentDay.tasks.push(cleanTask);
        }
      }
    });

    // Add the last day
    if (currentDay) {
      days.push(currentDay);
    }

    return days;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMilestones('');

    try {
      const prompt = `I am learning ${resource.title}. My current progress is ${resource.progress_minutes} out of ${resource.duration_minutes} minutes. Create a ${intensity.toLowerCase()}-intensity learning milestone plan to finish in ${days} days. Return a bullet list of daily goals.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          mode: 'milestone'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate milestones');
      }

      const data = await response.json();
      setMilestones(data.response || 'No milestones generated. Please try again.');
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error generating milestones:', error);
      setMilestones('Failed to generate milestones. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!milestones || days < 1) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsCreating(true);
    try {
      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      // Parse milestones into structured format
      const milestoneLines = milestones.split('\n').filter(line => line.trim());
      const structuredMilestones: Milestone[] = milestoneLines.map((line, index) => ({
        day: index + 1,
        description: line.replace(/^[-•*]\s*/, '').trim(),
        minutes: Math.ceil(resource.duration_minutes / days)
      }));

      const planData: LearningPlanInput = {
        title: resource.title,
        start_date: startDate.toISOString().split('T')[0],
        duration_days: days,
        daily_minutes: Math.ceil(resource.duration_minutes / days),
        learning_type: resource.type,
        milestones: structuredMilestones,
        end_date: endDate.toISOString().split('T')[0],
        status: 'active'
      };

      await insertLearningPlan(planData);
      addToast('Learning plan created successfully!', 'success');
      
      // Close modal and redirect to plans page (we'll build this later)
      onClose();
      router.push('/plans');
    } catch (error) {
      console.error('Error creating learning plan:', error);
      addToast('Failed to create learning plan. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('form');
  };

  const handleClose = () => {
    setCurrentStep('form');
    setMilestones('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI-Powered Milestone Generator</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
          {currentStep === 'form' ? (
            <>
              {/* Description */}
              <p className="text-gray-600">
                We'll create a learning schedule based on your goal and current progress for "{resource.title}".
              </p>

              {/* Current Progress Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Current Progress</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{resource.progress_minutes} / {resource.duration_minutes} minutes</span>
                  <span>{Math.round((resource.progress_minutes / resource.duration_minutes) * 100)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((resource.progress_minutes / resource.duration_minutes) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                {/* Days Input */}
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
                    📆 Finish in X days
                  </label>
                  <input
                    type="number"
                    id="days"
                    min="1"
                    max="365"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter number of days"
                  />
                </div>

                {/* Intensity Select */}
                <div>
                  <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
                    📈 Intensity (optional)
                  </label>
                  <select
                    id="intensity"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low - Relaxed pace, flexible schedule</option>
                    <option value="Medium">Medium - Balanced approach</option>
                    <option value="High">High - Intensive, focused sessions</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || days < 1}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Plan...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Preview Step */}
              <div className="space-y-4">
                {/* Back button at top */}
                <button
                  onClick={handleBack}
                  className="text-sm text-blue-500 underline mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  ← Back to Form
                </button>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Your Learning Plan</h3>
                  <div className="px-4 pt-4 pb-4">
                    {parseMilestones(milestones).length > 0 ? (
                      <div className="space-y-4">
                        {parseMilestones(milestones).map((day, index) => (
                          <div key={index} className="mb-6 p-4 bg-white shadow-sm rounded-md border border-gray-200">
                            <h3 className="font-semibold mb-2 text-gray-900">{day.title}</h3>
                            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                              {day.tasks.map((task, taskIndex) => (
                                <li key={taskIndex}>{task}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {milestones}
                        </div>
                      </div>
                    )}
                    
                    {/* Debug content to test modal scrolling */}
                    <div className="mt-8 p-4 bg-purple-50 rounded text-sm text-purple-800">
                      🔧 Debug: Modal scroll test. If you can see this message, modal scrolling is working! Try scrolling within this modal.
                    </div>
                    
                    {/* Extra test content to force scrolling */}
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div key={i} className="mt-4 p-4 bg-yellow-50 rounded text-sm">
                        Test scroll content #{i} - This should be scrollable within the modal
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 text-center">
                  <button
                    onClick={handleCreatePlan}
                    disabled={isCreating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Plan...
                      </>
                    ) : (
                      'Save Learning Plan'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
