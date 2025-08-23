import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Calendar, Clock, Target, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getLearningPlans } from '../supabase/learning-plans/getLearningPlans';
import { LearningPlan } from '../modules/learning-resources/types/learningPlan.types';
import { useUser } from '../modules/auth/hooks/useUser';

export default function PlansPage() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/my-learning" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to My Learning
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Learning Plans</h1>
          <p className="text-gray-600 mb-6">
            Your AI-generated learning plans will appear here. This page is under development.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              🎯 Plans created via the Milestone Generator will be stored here for easy access and tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
