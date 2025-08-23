import { useState, useEffect } from 'react';
import { SmartSuggestion } from '../types/smartSuggestions';
import { getHabitStreak } from '../../habits/utils/streakUtils';
import { useUser } from '../../auth/hooks/useUser';

// Sample suggestions for scaffolding - will be replaced with real logic in future prompts
const SAMPLE_SUGGESTIONS: SmartSuggestion[] = [
  { 
    id: '1', 
    type: 'nudge', 
    message: "You're 2 days into a reading streak. Keep it up!" 
  },
  { 
    id: '2', 
    type: 'milestone', 
    message: "Finish 'Atomic Habits' in 3 days? Let's do it!" 
  },
  { 
    id: '3', 
    type: 'tip', 
    message: "Try adding a custom tag to organize your resources." 
  },
  { 
    id: '4', 
    type: 'nudge', 
    message: "Great progress on 'Design of Everyday Things'! You're halfway through." 
  },
  { 
    id: '5', 
    type: 'milestone', 
    message: "Ready to tackle that podcast queue? Set a 30-minute daily goal!" 
  },
  { 
    id: '6', 
    type: 'tip', 
    message: "Use the milestone generator to create learning schedules that stick." 
  }
];

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
    const generateSuggestions = () => {
      const realSuggestions: SmartSuggestion[] = [];

      // Add streak-based nudge if user has an active streak (2+ days)
      if (streakData?.hasActiveStreak && streakData.currentStreak >= 2) {
        realSuggestions.push({
          id: `streak-${streakData.currentStreak}`,
          type: 'nudge',
          message: `🎉 You're on a ${streakData.currentStreak}-day streak! Keep it up!`
        });
      }

      // Add sample suggestions for other types (will be replaced with real logic in future prompts)
      const additionalSuggestions = SAMPLE_SUGGESTIONS.filter(s => s.type !== 'nudge');
      realSuggestions.push(...additionalSuggestions);

      // Filter out dismissed suggestions
      const availableSuggestions = realSuggestions.filter(
        suggestion => !dismissedSuggestions.has(suggestion.id)
      );

      setSuggestions(availableSuggestions);
    };

    generateSuggestions();
  }, [streakData, dismissedSuggestions]);

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
