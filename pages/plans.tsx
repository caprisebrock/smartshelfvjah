import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Calendar, Clock, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getLearningPlans } from '../supabase/learning-plans/getLearningPlans';
import { LearningPlan } from '../modules/learning-resources/types/learningPlan.types';
import { useUser } from '../modules/auth/hooks/useUser';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useUser();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userPlans = await getLearningPlans();
        setPlans(userPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load learning plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/my-learning" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to My Learning
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Learning Plans</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Your AI-generated learning plans will appear here.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  🎯 Plans created via the Milestone Generator will be stored here for easy access and tracking.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/plan/${plan.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {plan.daily_minutes} min/day
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {plan.duration_days} days
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>
                  
                  {plan.milestones && plan.milestones.length > 0 && (
                    <div className="px-4 pt-4 pb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Daily Milestones</h4>
                      <div className="space-y-3">
                        {plan.milestones.map((milestone, index) => (
                          <div key={index} className="mb-4 p-3 bg-gray-50 shadow-sm rounded-md border border-gray-100">
                            <h5 className="font-semibold mb-1 text-gray-900">Day {milestone.day}</h5>
                            <p className="text-sm text-gray-700">{milestone.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              Target: {milestone.minutes} minutes
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
