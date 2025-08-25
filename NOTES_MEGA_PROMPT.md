# ✅ CCMT MEGA MAX MODE PROMPT — SmartShelf Notes System (Final)

**Copy-paste this full prompt directly into Cursor Max Mode**

---

## C (Context)
You are building the full professional-grade Notes system for the SmartShelf app. SmartShelf helps users track learning resources (books, courses, podcasts, etc.) and habits, and now includes powerful AI-linked notes. The user wants the final version of the Notes feature, built from scratch in this prompt. It must work perfectly and reflect a polished, futuristic 2025-level product.

This system must be:
- Visually clean and modern with collapsible sidebar
- Functionally smooth with real-time autosave and full mobile responsiveness
- Fully integrated with AI chat per note (not global)
- Deeply aware of linked learning resources, reading progress, and habits

The Notes system should not reuse any old AI Chat code — the user previously deleted all general chat components. The new system should be modular and professional, using the new feature-based file structure (/modules/notes, /modules/ai-chat, etc.).

---

## C (Command)
You must build the entire Notes experience from end to end. Include:

---

### 1. 🗂 Notes Page UI (Full Page)
- **Route**: `/notes`
- **Layout**:
  - **Left Sidebar** (30% width, collapsible to 0%)
    - Shows all notes by title (latest at top)
    - Clicking a title routes to `/notes/[noteId]`
    - Add ❌ close icon to collapse
  - **Main Panel** (70% width, expands to 100% if sidebar collapsed)
    - 50/50 layout:
      - Left: Editable note content
      - Right: Smart AI chat
  - Empty state: Show soft animation + "Create your first note" CTA.
  - Notes are autosaved in real-time — no manual Save button.
  - Fully mobile responsive — collapses into stacked view.
  - UI should feel like Notion + ChatGPT hybrid.

---

### 2. ➕ New Note Page (/notes/new)
- **Inputs**:
  - Title (text)
  - Content (rich text with formatting: bold, italic, bullets, links)
  - Link to Learning Resource (dropdown)
  - Link to Habit (dropdown)
- **Save behavior**:
  - Autosaves in Supabase as soon as user starts typing.
  - Redirects to `/notes/[noteId]` after initial save.
  - All notes are stored in Supabase notes table with:
    - `id`, `created_at`, `user_id`, `title`, `content`, `linked_resource_id`, `linked_habit_id`

---

### 3. 🧠 AI Chat Panel (Per-Note)
- Tied to each individual note (not global).
- 50% panel on the right (or stacked on mobile).
- Each chat belongs to its note (`note_id` in Supabase).
- Use OpenAI API with smart token management.
- Store messages in `note_ai_messages` table:
  - `id`, `note_id`, `role` (user or assistant), `message`, `created_at`

**Chat Features**:
- Response tone selector:
  - Summary | Bullet Points | Deep Insight
- Smart awareness of:
  - Linked learning resource
  - Progress in minutes (from `progress_minutes`)
  - Linked habit name and streak if present
- Suggested prompt buttons: "Summarize this section", "Give me insights", etc.
- Insert AI to Note button: appends response to note content
- Errors show friendly toast + retry button
- New chat session begins per note automatically

---

### 4. ✍️ Note Editor Features
- Rich text support using editor like @tiptap/react or Quill
- **Supports**:
  - Bold, Italic, Bullet list, Numbered list, Links
  - Markdown rendering
  - Emoji support
- Autosave every 3 seconds or on content change
- Pin/Favorite note toggle (updates in Supabase)
- Track time spent editing each note (e.g., `editing_duration_minutes`)

---

### 5. 📱 Mobile Optimization
- Sidebar collapses fully
- Editor and AI stack vertically on small screens
- New Note and Back buttons clearly accessible

---

### 6. 🧠 Smart Features To Include

Add all 5 of the user's approved Smart Note ideas:
1. **Inline Markdown Rendering**: Render bold, links, bullets cleanly.
2. **Tagging System**: Allow users to add category tags.
3. **Favorite/Pin Notes**: Star icon toggles a note as pinned.
4. **Track Time Spent Writing**: Record writing session length per note.
5. **Quote Highlighting + Extraction**: AI can auto-extract quotes from note content and summarize them in response.

---

## M (Memory)
Save these decisions for all future Cursor prompts:
- Notes live at `/notes`, `/notes/new`, and `/notes/[noteId]`
- Notes link to learning resources and habits via dropdown
- AI is chat per note, not global
- Tables in Supabase are:
  - `notes` (note data)
  - `note_ai_messages` (chat messages)
- Styling: Clean, modern, minimalist UI with subtle animations and soft cards
- No fake data should ever be used in notes or chat
- All features must work on both desktop and mobile

---

## T (Testing)
Make sure:
- AI messages save and load correctly from `note_ai_messages`
- Linked resource info is visible to the AI
- Notes autosave and rehydrate with no errors
- Chat works even with no linked resource
- Sidebar collapses smoothly and note titles update live
- Inserting AI into note doesn't duplicate or break content

---

**Ready to copy into Cursor Max Mode!** 🚀
