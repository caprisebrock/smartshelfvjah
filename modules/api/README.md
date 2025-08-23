# API Routes Module

## Structure
```
modules/api/
├── auth/
│   └── callback.ts
├── habits/
│   ├── create.ts
│   ├── update.ts
│   └── delete.ts
├── notes/
│   ├── create.ts
│   ├── update.ts
│   └── delete.ts
├── ai/
│   ├── chat.ts
│   ├── ask.ts
│   ├── generate-title.ts
│   ├── quizMe.ts
│   └── topicSuggest.ts
├── resources/
│   ├── create.ts
│   └── update.ts
├── progress/
│   └── stats.ts
├── utils/
│   ├── ping.ts
│   └── test.ts
└── index.ts
```

## Auth
- **callback.ts**: Auth callback handler

## Habits
- **create.ts**: Create habit endpoint
- **update.ts**: Update habit endpoint
- **delete.ts**: Delete habit endpoint

## Notes
- **create.ts**: Create note endpoint
- **update.ts**: Update note endpoint
- **delete.ts**: Delete note endpoint

## AI
- **chat.ts**: Chat endpoint
- **ask.ts**: Ask AI endpoint
- **generate-title.ts**: Generate title endpoint
- **quizMe.ts**: Quiz generation endpoint
- **topicSuggest.ts**: Topic suggestion endpoint

## Resources
- **create.ts**: Create resource endpoint
- **update.ts**: Update resource endpoint

## Progress
- **stats.ts**: Progress statistics endpoint

## Utils
- **ping.ts**: Health check endpoint
- **test.ts**: Test endpoint 