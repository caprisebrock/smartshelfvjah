# AI Chat Module

## Structure
```
modules/ai-chat/
├── components/
│   ├── ChatInput.tsx
│   ├── MessageList.tsx
│   ├── ChatDock.tsx
│   ├── AskBot.tsx
│   └── TypingDots.tsx
├── pages/
│   ├── aichat.tsx
│   └── chat.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useNoteChat.ts
│   └── useAutoNameSession.ts
├── context/
│   └── ChatContext.tsx
├── services/
│   ├── aiService.ts
│   ├── getAIResponse.ts
│   ├── generateSessionTitle.ts
│   ├── chatNoteBridge.ts
│   └── saveMessageToSupabase.ts
├── types/
│   └── chat.types.ts
└── index.ts
```

## Components
- **ChatInput.tsx**: Input field for chat messages
- **MessageList.tsx**: Display list of chat messages
- **ChatDock.tsx**: Dockable chat interface
- **AskBot.tsx**: AI question interface
- **TypingDots.tsx**: Typing indicator animation

## Pages
- **aichat.tsx**: AI chat page
- **chat.tsx**: Chat page

## Hooks
- **useChat.ts**: Hook for chat functionality
- **useNoteChat.ts**: Hook for note chat integration
- **useAutoNameSession.ts**: Auto-naming session hook

## Context
- **ChatContext.tsx**: React context for chat state

## Services
- **aiService.ts**: AI service integration
- **getAIResponse.ts**: AI response generation
- **generateSessionTitle.ts**: Session title generation
- **chatNoteBridge.ts**: Chat-note integration bridge
- **saveMessageToSupabase.ts**: Message persistence

## Types
- **chat.types.ts**: Chat-related type definitions 