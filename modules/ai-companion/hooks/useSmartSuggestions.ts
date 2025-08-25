import { useState, useEffect } from 'react';
import { SmartSuggestion } from '../types/smartSuggestions';
import { getHabitStreak } from '../../habits/utils/streakUtils';
import { useUser } from '../../auth/hooks/useUser';
import { supabase } from '../../database/config/databaseConfig';

// Interface for learning resource from database
interface LearningResource {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  type: string;
  duration_minutes: number;
  progress_minutes: number;
  updated_at: string;
}

// Sample non-milestone suggestions (tips only - milestones generated from real data)
const SAMPLE_TIPS: SmartSuggestion[] = [
  { 
    id: 'tip-1', 
    type: 'tip', 
    message: "Try adding a custom tag to organize your resources." 
  },
  { 
    id: 'tip-2', 
    type: 'tip', 
    message: "Use the milestone generator to create learning schedules that stick." 
  }
];

// Function to generate a smart milestone from real learning resources
async function generateSmartMilestone(userId: string): Promise<SmartSuggestion | null> {
  try {
    // Query real learning resources from Supabase
    const { data: resources, error } = await supabase
      .from('learning_resources')
      .select('id, title, emoji, type, duration_minutes, progress_minutes, updated_at')
      .eq('user_id', userId)
      .gt('duration_minutes', 0) // Must have duration > 0
      .order('updated_at', { ascending: false }); // Most recently updated first

    if (error || !resources || resources.length === 0) {
      return null; // No eligible resources
    }

    // Filter to only incomplete resources (progress < duration) and select most recent
    const incompleteResources = resources.filter(r => r.progress_minutes < r.duration_minutes);
    
    if (incompleteResources.length === 0) {
      return null; // No incomplete resources
    }

    // Select the most recently active resource
    const activeResource = incompleteResources[0] as LearningResource;
    
    // Calculate remaining minutes
    const remainingMinutes = activeResource.duration_minutes - activeResource.progress_minutes;
    
    if (remainingMinutes <= 0) {
      return null; // Resource is already completed
    }
    
    // Estimate completion time based on ~40 min/day pace
    const dailyPaceMinutes = 40;
    const estimatedDays = Math.ceil(remainingMinutes / dailyPaceMinutes);
    
    // Adjust days to be reasonable (1-7 days)
    const adjustedDays = Math.max(1, Math.min(7, estimatedDays));
    
    // Create milestone message
    const emoji = activeResource.emoji || '📚';
    const message = `${emoji} Finish '${activeResource.title}' in ${adjustedDays} ${adjustedDays === 1 ? 'day' : 'days'}? Let's do it!`;
    
    return {
      id: `milestone-${activeResource.id}`,
      type: 'milestone',
      message
    };
  } catch (error) {
    console.error('Error generating smart milestone:', error);
    return null;
  }
}

export function useSmartSuggestions() {
  const { user } = useUser();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [streakData, setStreakData] = useState<{ currentStreak: number; hasActiveStreak: boolean } | null>(null);

  useEffect(() => {
    // Load dismissed suggestions from localStorage
    const dismissed = localStorage.getItem('dismissedSmartSuggestions');
    if (dismissed) {
      try {
        const dismissedIds = JSON.parse(dismissed);
        setDismissedSuggestions(new Set(dismissedIds));
      } catch (error) {
        console.error('Error loading dismissed suggestions:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch real streak data
    const fetchStreakData = async () => {
      if (!user?.id) return;

      try {
        const streak = await getHabitStreak(user.id);
        setStreakData(streak);
      } catch (error) {
        console.error('Error fetching streak data:', error);
      }
    };

    fetchStreakData();
  }, [user?.id]);

  useEffect(() => {
    // Generate suggestions based on real data
    const generateSuggestions = async () => {
      const realSuggestions: SmartSuggestion[] = [];

      // Add streak-based nudge if user has an active streak (2+ days)
      if (streakData?.hasActiveStreak && streakData.currentStreak >= 2) {
        realSuggestions.push({
          id: `streak-${streakData.currentStreak}`,
          type: 'nudge',
          message: `🎉 You're on a ${streakData.currentStreak}-day streak! Keep it up!`
        });
      }

      // ✅ Generate milestone from real learning_resources in Supabase
      if (user?.id) {
        const smartMilestone = await generateSmartMilestone(user.id);
        if (smartMilestone) {
          realSuggestions.push(smartMilestone);
        }
      }

      // Add sample tips (non-milestone suggestions)
      realSuggestions.push(...SAMPLE_TIPS);

      // Filter out dismissed suggestions
      const availableSuggestions = realSuggestions.filter(
        suggestion => !dismissedSuggestions.has(suggestion.id)
      );

      setSuggestions(availableSuggestions);
    };

    generateSuggestions();
  }, [streakData, dismissedSuggestions, user?.id]);

  const dismissSuggestion = (suggestionId: string) => {
    const newDismissed = new Set(dismissedSuggestions);
    newDismissed.add(suggestionId);
    setDismissedSuggestions(newDismissed);

    // Save to localStorage
    localStorage.setItem('dismissedSmartSuggestions', JSON.stringify(Array.from(newDismissed)));

    // Remove from current suggestions
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getCurrentSuggestion = (): SmartSuggestion | null => {
    return suggestions.length > 0 ? suggestions[0] : null;
  };

  return {
    suggestions,
    currentSuggestion: getCurrentSuggestion(),
    dismissSuggestion
  };
}
