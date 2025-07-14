# SmartShelf - Personal Learning Dashboard

SmartShelf is a modern web application designed to help you track your audiobook learning journey, log business and marketing insights, and leverage AI to enhance your learning experience.

## Features

### 📚 Audiobook Tracking
- Add and manage your audiobook collection
- Track reading progress and completion status
- Add personal notes and insights for each book

### 📝 Learning Notes
- Categorize insights by business, marketing, leadership, and personal development
- Tag system for easy organization and retrieval
- Mark favorite insights for quick access
- Full-text search across all your notes

### 🤖 AI-Powered Features
- Ask questions about your notes using GPT
- Generate personalized quizzes from your learning content
- Get study recommendations based on your knowledge gaps
- Extract key insights and themes from your notes

### 📊 Progress Tracking
- Visual dashboard showing learning progress over time
- Statistics on books completed and notes logged
- Learning habit tracking and analytics

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase or Supabase (configurable)
- **AI**: OpenAI GPT API
- **Authentication**: NextAuth.js (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key
- Database (Firebase or Supabase account)

### Installation

1. **Clone and setup:**
   ```bash
   cd smart-shelf
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   # Add your database credentials (Firebase or Supabase)
   ```

3. **Configure Database:**
   
   **Option A: Firebase**
   - Create a Firebase project
   - Enable Firestore
   - Add your config to `.env.local`
   - Uncomment Firebase imports in `lib/db.ts`

   **Option B: Supabase**
   - Create a Supabase project
   - Set up tables for books and notes
   - Add your config to `.env.local`
   - Uncomment Supabase imports in `lib/db.ts`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
smart-shelf/
├── pages/
│   ├── index.tsx          # Main dashboard
│   ├── books.tsx          # Audiobook tracker
│   ├── notes.tsx          # Learning notes
│   ├── ai.tsx             # AI assistant
│   └── api/               # API routes
│       ├── addBook.ts     # Add book endpoint
│       ├── addNote.ts     # Add note endpoint
│       ├── ask.ts         # AI chat endpoint
│       ├── quizMe.ts      # Quiz generation
│       └── topicSuggest.ts # Study recommendations
├── components/
│   ├── BookForm.tsx       # Book entry form
│   ├── NoteForm.tsx       # Note entry form
│   ├── AskBot.tsx         # AI chat interface
│   └── ProgressChart.tsx  # Learning analytics
├── lib/
│   ├── db.ts              # Database configuration
│   └── openai.ts          # AI service functions
└── package.json
```

## Usage Guide

### Adding Books
1. Navigate to the Books page
2. Click "Add Book"
3. Fill in title, author, duration, and current progress
4. Add any notes or insights

### Logging Learning Notes
1. Go to the Notes page
2. Click "Add Note"
3. Choose a category (business, marketing, leadership, etc.)
4. Add tags for better organization
5. Write your insight or key takeaway

### Using the AI Assistant
1. Visit the AI page
2. Ask questions about your notes:
   - "What are the key themes in my business notes?"
   - "Create a quiz from my marketing insights"
   - "What should I study next?"
3. Get personalized recommendations and insights

### Tracking Progress
- Dashboard shows your learning statistics
- Progress charts visualize your journey over time
- Set goals and track completion rates

## Development Phases

### Phase 1: Core UI/UX ✅
- Basic page layouts and navigation
- Form components for data entry
- Responsive design with Tailwind CSS

### Phase 2: Database Integration
- Implement chosen database (Firebase/Supabase)
- CRUD operations for books and notes
- User authentication (optional)

### Phase 3: AI Features
- OpenAI API integration
- Chat functionality for asking about notes
- Quiz generation from learning content
- Smart recommendations engine

### Phase 4: Advanced Analytics
- Learning progress visualization
- Habit tracking and goal setting
- Export functionality for notes
- Social features (sharing insights)

## API Endpoints

- `POST /api/addBook` - Add a new book
- `POST /api/addNote` - Add a learning note
- `POST /api/ask` - Ask AI about your notes
- `POST /api/quizMe` - Generate quiz questions
- `POST /api/topicSuggest` - Get study recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own learning journey!

## Support

For questions or issues:
- Check the documentation
- Review the example environment file
- Ensure your API keys are correctly configured
- Verify your database connection

Happy Learning! 📚✨ 