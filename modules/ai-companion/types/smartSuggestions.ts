export type SmartSuggestion = {
  id: string;
  type: 'nudge' | 'milestone' | 'tip';
  message: string;
}
