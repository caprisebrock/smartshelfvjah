import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, Clock, Target } from 'lucide-react';
import { useUser } from '../../modules/auth/hooks/useUser';
import { supabase } from '../../modules/database/config/databaseConfig';
import { LearningPlan } from '../../modules/learning-resources/types/learningPlan.types';

export default function LearningPlanPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!id || !user?.id || typeof id !== 'string') return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('learning_plans')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error('Error loading plan:', fetchError);
          setError('Failed to load learning plan');
        } else {
          setPlan(data);
        }
      } catch (err) {
        console.error('Error loading plan:', err);
        setError('Failed to load learning plan');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [id, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Plan - SmartShelf</title>
        </Head>
        <div className="flex flex-col h-screen overflow-y-auto bg-gray-50">
          <div className="p-6 max-w-4xl mx-auto w-full">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !plan) {
    return (
      <>
        <Head>
          <title>Plan Not Found - SmartShelf</title>
        </Head>
        <div className="flex flex-col h-screen overflow-y-auto bg-gray-50">
          <div className="p-6 max-w-4xl mx-auto w-full">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Plan Not Found</h2>
              <p className="text-gray-600 mb-6">The learning plan you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
              <button
                onClick={() => router.push('/plans')}
                className="flex items-center gap-2 text-blue-500 hover:underline mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Plans
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{plan.title} - Learning Plan - SmartShelf</title>
        <meta name="description" content={`Learning plan for ${plan.title}`} />
      </Head>
      <div className="flex flex-col h-screen overflow-y-auto px-4 py-6 bg-white">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/plans')}
            className="text-sm text-blue-500 underline mb-4 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            ← Back to Plans
          </button>

          {/* Plan Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-4">{plan.title}</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-6 text-sm text-gray-600">
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
              </div>
            </div>
          </div>

          {/* Learning Plan Content */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Learning Plan</h2>
            
            {/* Debug info to test scrolling */}
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Debug: This page should be scrollable. If you see this message and can scroll to see more content below, scrolling is working.
              {plan.milestones && ` (${plan.milestones.length} days to display)`}
            </div>
            
            {plan.milestones && plan.milestones.length > 0 ? (
              <div className="space-y-6">
                {plan.milestones.map((milestone, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 className="font-semibold text-lg mb-2">Day {milestone.day}</h2>
                    <p className="text-sm text-gray-700 mb-2">{milestone.description}</p>
                    <div className="text-xs text-gray-500">
                      Target: {milestone.minutes} minutes
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No milestones available for this plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
