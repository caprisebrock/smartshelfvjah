# Database Module

## Structure
```
modules/database/
├── config/
│   ├── supabaseClient.ts
│   └── db.ts
├── migrations/
│   ├── chat_tables.sql
│   ├── habit_completions_table.sql
│   ├── add_client_id_to_messages.sql
│   └── migrate_habit_completions.sql
├── services/
│   ├── chatService.ts
│   ├── habitService.ts
│   ├── noteService.ts
│   └── saveMessageToSupabase.ts
├── types/
│   └── database.types.ts
└── index.ts
```

## Config
- **supabaseClient.ts**: Supabase client configuration
- **db.ts**: Database configuration and types

## Migrations
- **chat_tables.sql**: Chat system database tables
- **habit_completions_table.sql**: Habit completions table
- **add_client_id_to_messages.sql**: Add client ID to messages
- **migrate_habit_completions.sql**: Habit completions migration

## Services
- **chatService.ts**: Chat database operations
- **habitService.ts**: Habits database operations
- **noteService.ts**: Notes database operations
- **saveMessageToSupabase.ts**: Message persistence service

## Types
- **database.types.ts**: Database type definitions 