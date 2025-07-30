# Database Setup for SmartShelf Habits

This directory contains the SQL scripts needed to set up the habit tracking functionality in your Supabase database.

## Setup Instructions

### 1. Create the habit_completions table

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of habit_completions_table.sql
```

This will:
- Create the `habit_completions` table with proper constraints
- Set up indexes for optimal query performance
- Enable Row Level Security (RLS) for data protection
- Create RLS policies to ensure users can only access their own data
- Set up automatic timestamp updates

### 2. Verify the setup

After running the script, you can verify the table was created correctly by running:

```sql
-- Check if the table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'habit_completions';

-- Check the table structure
\d habit_completions

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'habit_completions';
```

## Table Structure

The `habit_completions` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `habit_id` | UUID | Foreign key to habits table |
| `user_id` | UUID | Foreign key to auth.users table |
| `date` | DATE | The date of completion |
| `status` | TEXT | Status ('complete' or 'incomplete') |
| `created_at` | TIMESTAMP | When the record was created |
| `updated_at` | TIMESTAMP | When the record was last updated |

## Constraints

- **Unique constraint**: One completion record per habit per user per date
- **Foreign key constraints**: References to habits and users tables
- **Check constraint**: Status must be 'complete' or 'incomplete'

## Security

- Row Level Security (RLS) is enabled
- Users can only access their own completion records
- All CRUD operations are restricted to the authenticated user's data

## Indexes

- `idx_habit_completions_habit_user_date`: Optimizes queries by habit, user, and date
- `idx_habit_completions_user_date`: Optimizes queries by user and date

## Usage

Once the table is set up, the application will automatically:

1. Insert completion records when users click "Mark Done"
2. Prevent duplicate entries for the same day
3. Load completion data when displaying habits
4. Update the UI to reflect completion status 