import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '../modules/auth/hooks/useUser';
import { useProtectedRoute } from '../modules/auth/hooks/useProtectedRoute';
import { useHabits } from '../modules/habits/context/HabitsContext';
import { supabase } from '../modules/database/config/databaseConfig';
import Layout from '../modules/shared/components/Layout';
import HabitCard from '../modules/habits/components/HabitCard';
import BackButton from '../modules/shared/components/BackButton';
import { Target, Plus, RefreshCw } from 'lucide-react';

export default function HabitsPage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const { state, dispatch } = useHabits();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh habits data from database
  const refreshHabits = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching habits:', fetchError);
        setError('Failed to load habits. Please try again.');
        return;
      }

      // Transform database habits to match our interface
      const transformedHabits = (data || []).map(dbHabit => ({
        id: dbHabit.id.toString(),
        name: dbHabit.name,
        emoji: dbHabit.emoji,
        color: dbHabit.color,
        frequency: dbHabit.frequency,
        specificDays: dbHabit.specific_days || undefined,
        dateCreated: dbHabit.created_at || new Date().toISOString(),
        streak: 0, // TODO: Calculate from completions
        completions: [] // TODO: Load completions from database
      }));

      dispatch({ type: 'LOAD_HABITS', payload: transformedHabits });
    } catch (err) {
      console.error('Error refreshing habits:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, dispatch]);

  // Load habits when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refreshHabits();
    }
  }, [user?.id, refreshHabits]);

  // Handle success message from onboarding
  useEffect(() => {
    if (router.query['first-habit'] === 'success') {
      // Refresh habits to ensure the new one shows up
      setTimeout(() => {
        refreshHabits();
        // Remove the query param
        const { 'first-habit': removed, ...rest } = router.query;
        router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
      }, 1000);
    }
  }, [router.query, refreshHabits, router]);

  if (authLoading) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar>
      <Head>
        <title>My Habits - SmartShelf</title>
        <meta name="description" content="Manage and track your daily habits" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Habits</h1>
              <p className="text-lg text-gray-600 mt-1">Track your daily progress and build lasting routines</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={refreshHabits}
              disabled={loading}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              title="Refresh habits"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Add Habit Button */}
            <Link
              href="/add-habit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Habit
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {router.query['first-habit'] === 'success' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div>
                <div className="font-semibold text-emerald-800">Congratulations!</div>
                <div className="text-sm text-emerald-600">Your first habit has been created successfully!</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Habits Grid */}
        <div className="space-y-6">
          {loading && state.habits.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your habits...</p>
            </div>
          ) : state.habits.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Start Building Better Habits</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create personalized habits with custom emojis, colors, and schedules. 
                Track your progress and build lasting routines.
              </p>
              <Link
                href="/add-habit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Your First Habit
              </Link>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{state.habits.length}</div>
                      <div className="text-sm text-gray-600">Total Habits</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <div className="text-emerald-600 font-bold">📅</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {state.habits.filter(h => h.frequency === 'daily').length}
                      </div>
                      <div className="text-sm text-gray-600">Daily Habits</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <div className="text-purple-600 font-bold">🔥</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-600">Current Streak</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.habits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
} 