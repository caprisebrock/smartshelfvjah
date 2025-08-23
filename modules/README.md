# SmartShelf Modules

## Overview
This directory contains the modular structure for the SmartShelf application, organized by domain and functionality.

## Module Structure

### Core Modules
- **auth/**: Authentication, user management, and authorization
- **habits/**: Habit tracking, creation, and management
- **notes/**: Note taking, editing, and organization
- **ai-chat/**: AI-powered chat functionality and conversations
- **learning-resources/**: Books, courses, and learning materials
- **progress/**: Progress tracking, charts, and insights
- **shared/**: Common components, hooks, and utilities
- **database/**: Database configuration, migrations, and services
- **onboarding/**: User onboarding flow and steps
- **profile/**: User profile management and settings
- **dashboard/**: Main dashboard and overview components
- **session/**: AI chat sessions and management
- **ask-ai/**: AI question interface and functionality
- **settings/**: Application settings and configuration
- **styles/**: Global styles and CSS modules

## Migration Guide
1. Move files from their current locations to the appropriate module directories
2. Update import paths throughout the codebase
3. Create index.ts files for each module to export public APIs
4. Update API routes to match the new structure

## Benefits
- Clear separation of concerns
- Easier testing and maintenance
- Better code organization
- Reduced coupling between features
- Improved developer experience 