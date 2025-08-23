# Migration Checklist

## Files to Move by Module

### Auth Module
- [ ] `components/AuthWrapper.tsx` → `modules/auth/components/`
- [ ] `components/GoogleSignInButton.tsx` → `modules/auth/components/`
- [ ] `components/SignOutButton.tsx` → `modules/auth/components/`
- [ ] `components/UserMenu.tsx` → `modules/auth/components/`
- [ ] `pages/auth.tsx` → `modules/auth/pages/`
- [ ] `pages/login.tsx` → `modules/auth/pages/`
- [ ] `pages/signin.tsx` → `modules/auth/pages/`
- [ ] `pages/signup.tsx` → `modules/auth/pages/`
- [ ] `pages/sign-up.tsx` → `modules/auth/pages/`
- [ ] `lib/useUser.ts` → `modules/auth/hooks/`
- [ ] `lib/useProtectedRoute.ts` → `modules/auth/hooks/`
- [ ] `lib/createUserProfile.ts` → `modules/auth/services/`
- [ ] `lib/ensurePublicUser.ts` → `modules/auth/services/`

### Habits Module
- [ ] `components/HabitCard.tsx` → `modules/habits/components/`
- [ ] `components/HabitGrid.tsx` → `modules/habits/components/`
- [ ] `components/HabitHistory.tsx` → `modules/habits/components/`
- [ ] `components/HabitStats.tsx` → `modules/habits/components/`
- [ ] `components/AddHabitForm.tsx` → `modules/habits/components/`
- [ ] `components/DeleteHabitModal.tsx` → `modules/habits/components/`
- [ ] `components/CalendarView.tsx` → `modules/habits/components/`
- [ ] `lib/HabitsContext.tsx` → `modules/habits/context/`
- [ ] `pages/add-habit.tsx` → `modules/habits/pages/`
- [ ] `pages/habits.tsx` → `modules/habits/pages/`

### Notes Module
- [ ] `components/Notes/NotesEditor.tsx` → `modules/notes/components/`
- [ ] `components/Notes/NotesList.tsx` → `modules/notes/components/`
- [ ] `components/NoteForm.tsx` → `modules/notes/components/`
- [ ] `components/Notes/LinkedResourceBadge.tsx` → `modules/notes/components/`
- [ ] `components/Notes/ResizablePanel.tsx` → `modules/notes/components/`
- [ ] `lib/notes.ts` → `modules/notes/services/`
- [ ] `pages/notes.tsx` → `modules/notes/pages/`

### AI Chat Module
- [ ] `components/ChatInput.tsx` → `modules/ai-chat/components/`
- [ ] `components/MessageList.tsx` → `modules/ai-chat/components/`
- [ ] `components/ChatDock.tsx` → `modules/ai-chat/components/`
- [ ] `components/AskBot.tsx` → `modules/ai-chat/components/`
- [ ] `components/ui/TypingDots.tsx` → `modules/ai-chat/components/`
- [ ] `lib/ChatContext.tsx` → `modules/ai-chat/context/`
- [ ] `lib/getAIResponse.ts` → `modules/ai-chat/services/`
- [ ] `lib/generateSessionTitle.ts` → `modules/ai-chat/services/`
- [ ] `lib/chatNoteBridge.ts` → `modules/ai-chat/services/`
- [ ] `lib/supabase/saveMessageToSupabase.ts` → `modules/ai-chat/services/`
- [ ] `lib/useNoteChat.ts` → `modules/ai-chat/hooks/`
- [ ] `pages/aichat.tsx` → `modules/ai-chat/pages/`

### Learning Resources Module
- [ ] `components/BookForm.tsx` → `modules/learning-resources/components/`
- [ ] `pages/add-resource.tsx` → `modules/learning-resources/pages/`
- [ ] `pages/my-learning.tsx` → `modules/learning-resources/pages/`
- [ ] `pages/resource/[id].tsx` → `modules/learning-resources/pages/`
- [ ] `pages/api/addBook.ts` → `modules/learning-resources/services/`

### Progress Module
- [ ] `components/ProgressChart.tsx` → `modules/progress/components/`
- [ ] `components/StatBadge.tsx` → `modules/progress/components/`
- [ ] `components/InsightsList.tsx` → `modules/progress/components/`
- [ ] `pages/progress.tsx` → `modules/progress/pages/`
- [ ] `pages/stats.tsx` → `modules/progress/pages/`
- [ ] `pages/history.tsx` → `modules/progress/pages/`
- [ ] `pages/insights.tsx` → `modules/progress/pages/`

### Shared Module
- [ ] `components/BackButton.tsx` → `modules/shared/components/`
- [ ] `components/Layout.tsx` → `modules/shared/components/`
- [ ] `components/Sidebar.tsx` → `modules/shared/components/`
- [ ] `components/Toast.tsx` → `modules/shared/components/`
- [ ] `components/ConfirmDeleteModal.tsx` → `modules/shared/components/`
- [ ] `components/MotivationalQuote.tsx` → `modules/shared/components/`
- [ ] `components/ProfileForm.tsx` → `modules/shared/components/`
- [ ] `lib/ThemeContext.tsx` → `modules/shared/context/`
- [ ] `lib/ToastContext.tsx` → `modules/shared/context/`
- [ ] `lib/useOnboardingGuard.ts` → `modules/shared/hooks/`
- [ ] `lib/useSmartScroll.ts` → `modules/shared/hooks/`
- [ ] `lib/utils.ts` → `modules/shared/utils/`
- [ ] `components/ui/Avatar.tsx` → `modules/shared/ui/`

### Database Module
- [ ] `lib/supabaseClient.ts` → `modules/database/config/`
- [ ] `lib/db.ts` → `modules/database/config/`
- [ ] `database/*.sql` → `modules/database/migrations/`
- [ ] `database/README.md` → `modules/database/`

### Onboarding Module
- [ ] `pages/onboarding/step1.tsx` → `modules/onboarding/pages/`
- [ ] `pages/onboarding/step2.tsx` → `modules/onboarding/pages/`
- [ ] `pages/onboarding/first-habit.tsx` → `modules/onboarding/pages/`
- [ ] `pages/onboarding.tsx` → `modules/onboarding/pages/`

### Profile Module
- [ ] `components/ProfilePanel.tsx` → `modules/profile/components/`
- [ ] `pages/profile.tsx` → `modules/profile/pages/`

### Dashboard Module
- [ ] `pages/index.tsx` → `modules/dashboard/pages/`

### Session Module
- [ ] `pages/session.tsx` → `modules/session/pages/`

### Ask AI Module
- [ ] `pages/ask-ai.tsx` → `modules/ask-ai/pages/`
- [ ] `lib/openai.ts` → `modules/ask-ai/services/`

### Settings Module
- [ ] `pages/settings.tsx` → `modules/settings/pages/`

### Styles Module
- [ ] `styles/globals.css` → `modules/styles/`
- [ ] `styles/notes.css` → `modules/styles/`

### API Routes Module
- [ ] `pages/api/chat.ts` → `modules/api/ai/`
- [ ] `pages/api/ask.ts` → `modules/api/ai/`
- [ ] `pages/api/generate-title.ts` → `modules/api/ai/`
- [ ] `pages/api/quizMe.ts` → `modules/api/ai/`
- [ ] `pages/api/topicSuggest.ts` → `modules/api/ai/`
- [ ] `pages/api/addBook.ts` → `modules/api/resources/`
- [ ] `pages/api/addNote.ts` → `modules/api/notes/`
- [ ] `pages/api/chat-notes.ts` → `modules/api/ai/`
- [ ] `pages/api/chat-name.ts` → `modules/api/ai/`
- [ ] `pages/api/ping.ts` → `modules/api/utils/`
- [ ] `pages/api/test.ts` → `modules/api/utils/`
- [ ] `pages/auth/callback.tsx` → `modules/api/auth/`

### Hooks Module
- [ ] `hooks/useAutoNameSession.ts` → `modules/ai-chat/hooks/`

## After Moving Files
1. [ ] Update all import paths throughout the codebase
2. [ ] Create index.ts files for each module
3. [ ] Update _app.tsx to import from new module paths
4. [ ] Test all functionality to ensure nothing is broken
5. [ ] Update build configuration if needed
6. [ ] Remove old empty directories
7. [ ] Update documentation and README files 