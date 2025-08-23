import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { TrendingUp, BarChart3 } from 'lucide-react';
import ProgressChart from '../modules/progress/components/ProgressChart';
import BackButton from '../modules/shared/components/BackButton';
import { useHabits } from '../modules/habits/context/HabitsContext';
import { useUser } from '../modules/auth/hooks/useUser';
import { supabase } from '../modules/database/config/databaseConfig';

interface LearningResource {
  id: string;
  user_id: string;
  emoji: string;
  type: string;
  title: string;
  author?: string;
  duration_minutes: number;
  progress_minutes: number;
  category_tags: string[];
  reminder_date?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to get date key for grouping
function getDateKey(dateStr: string, range: string) {
  const d = new Date(dateStr);
  if (range === 'weekly') return d.toISOString().slice(0, 10); // Daily for weekly view
  if (range === 'monthly') return d.toISOString().slice(0, 10); // Daily for monthly view
  if (range === 'yearly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // Monthly for yearly view
  return d.toISOString().slice(0, 10);
}

// Helper function to generate date range
function generateDateRange(range: string) {
  const today = new Date();
  const dates: string[] = [];
  
  if (range === 'weekly') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().slice(0, 10));
    }
  } else if (range === 'monthly') {
    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().slice(0, 10));
    }
  } else if (range === 'yearly') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
  }
  
  return dates;
}



export default function ProgressPage() {
  const { state: { habits } } = useHabits();
  const { user } = useUser();
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Weekly');
  const [filterTag, setFilterTag] = useState('All');

  // Fetch learning resources from Supabase
  useEffect(() => {
    const loadLearningResources = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('learning_resources')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading learning resources:', error);
        } else {
          setLearningResources(data || []);
        }
      } catch (err) {
        console.error('Error loading learning resources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLearningResources();
  }, [user?.id]);

  // Filtered resources by type
  const filteredResources = filterTag === 'All'
    ? learningResources
    : learningResources.filter(r => r.type === filterTag);

  // Filtered habits (all habits for now, can be enhanced with date filtering later)
  const filteredHabits = habits;

  // Process learning data for chart
  const chartData = useMemo(() => {
    const dateRange = generateDateRange(timeRange.toLowerCase());
    const progressByDate: Record<string, number> = {};
    
    // Initialize all dates with 0
    dateRange.forEach(date => {
      progressByDate[date] = 0;
    });
    
    // Add actual progress data
    filteredResources.forEach(r => {
      if (r.progress_minutes > 0) {
        // Use updated_at for recent activity, fallback to created_at
        const dateToUse = r.updated_at || r.created_at;
        const key = getDateKey(dateToUse, timeRange.toLowerCase());
        
        // Only include if it's within our date range
        if (progressByDate.hasOwnProperty(key)) {
          progressByDate[key] += r.progress_minutes;
        }
      }
    });
    
    // For yearly view, we need to aggregate by month
    if (timeRange.toLowerCase() === 'yearly') {
      const monthlyData: Record<string, number> = {};
      Object.keys(progressByDate).forEach(date => {
        const monthKey = date.split('-').slice(0, 2).join('-');
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + progressByDate[date];
      });
      
      // Update progressByDate with monthly totals
      Object.keys(progressByDate).forEach(date => {
        const monthKey = date.split('-').slice(0, 2).join('-');
        progressByDate[date] = monthlyData[monthKey] || 0;
      });
    }
    
    // Convert to array format for recharts
    return dateRange.map(date => ({
      date: timeRange === 'Yearly' 
        ? new Date(date + '-01').toLocaleDateString('en-US', { month: 'short' })
        : new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
      minutes: progressByDate[date],
      fullDate: date
    }));
  }, [filteredResources, timeRange]);

  const learningData = filteredResources;
  const hasData = learningData.length > 0 && chartData.some(d => d.minutes > 0);

  return (
    <>
      <Head>
        <title>Progress - SmartShelf</title>
        <meta name="description" content="Track your learning progress over time" />
      </Head>
      <div className="min-h-screen bg-white animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8 animate-slideIn">
            <BackButton />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Progress Overview</h1>
              </div>
              <p className="text-gray-600">Track your learning progress and streaks over time</p>
            </div>
          </div>

          <div className="px-6 py-4 space-y-10">
            {/* 🔹 Habit Streaks Section */}
            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-2">Habit Streaks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredHabits.map((habit) => (
                  <div key={habit.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl mb-1">{habit.emoji}</div>
                    <div className="font-semibold text-gray-800">{habit.name}</div>
                    <div className="text-sm text-gray-500">Streak: {habit.streak || 0} days</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔸 Learning Progress Section */}
            <div>
              <h2 className="text-lg font-semibold text-blue-600 mb-4">Learning Progress</h2>

              {/* Time Range and Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex gap-2">
                  {['Weekly', 'Monthly', 'Yearly'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {['All', 'Books', 'Podcasts', 'Videos', 'Courses', 'Articles'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filterTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Resource Cards */}
              {filteredResources.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredResources.map((resource) => (
                    <div key={resource.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{resource.emoji}</span>
                        <h3 className="font-semibold text-gray-800 truncate">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {resource.author && `by ${resource.author}`}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {resource.progress_minutes} / {resource.duration_minutes} min
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Learning Progress Chart */}
              <div className="w-full bg-white p-6 rounded-lg border border-gray-200">
                {loading ? (
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p>Loading learning data...</p>
                  </div>
                ) : learningData.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📉</div>
                    <p className="mb-2">No learning activity yet.</p>
                    <p className="text-sm">Start tracking your books, podcasts, and more to see your progress here.</p>
                  </div>
                ) : (
                  <ProgressChart data={chartData} range={timeRange.toLowerCase()} hasData={hasData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 