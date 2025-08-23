// ============================================================================
// LEARNING RESOURCES MODULE TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript interfaces and types for the Learning Resources module
// Extracted from the moved files to ensure type safety and consistency

// ============================================================================
// CORE RESOURCE INTERFACES
// ============================================================================

export interface LearningResource {
  id: string;
  title: string;
  author: string;
  type: ResourceType;
  duration: number; // in minutes
  progress: number; // percentage 0-100
  status: ResourceStatus;
  notes: string;
  dateAdded: string;
  userId?: string;
  emoji?: string;
  imageUrl?: string;
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  isbn?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  duration: number; // in minutes
  progress: number; // percentage 0-100
  status: ResourceStatus;
  notes: string;
  dateAdded: string;
  userId?: string;
  pageCount?: number;
  publishedDate?: string;
  isbn?: string;
  imageUrl?: string;
  description?: string;
}

// ============================================================================
// FORM AND STATE INTERFACES
// ============================================================================

export interface ResourceFormData {
  emoji: string;
  type: ResourceType;
  title: string;
  author: string;
  duration: string;
  progress: string;
  notes?: string;
  status?: ResourceStatus;
}

export interface ResourceFormState {
  emoji: string;
  type: ResourceType;
  title: string;
  author: string;
  duration: string;
  progress: string;
  notes: string;
  status: ResourceStatus;
}

export interface ResourceFormErrors {
  [key: string]: string;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface BookFormProps {
  onSubmit: (book: {
    title: string;
    author: string;
    duration: number;
    progress: number;
    status: ResourceStatus;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export interface ResourceCardProps {
  resource: LearningResource;
  onEdit?: (resource: LearningResource) => void;
  onDelete?: (id: string) => void;
  onProgressUpdate?: (id: string, progress: number) => void;
}

export interface ResourceListProps {
  resources: LearningResource[];
  onResourceClick?: (resource: LearningResource) => void;
  onEdit?: (resource: LearningResource) => void;
  onDelete?: (id: string) => void;
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface AddBookParams {
  title: string;
  author: string;
  duration: number;
  progress: number;
  status: ResourceStatus;
  notes: string;
  userId?: string;
}

export interface AddBookResult {
  success: boolean;
  book: Book;
  message: string;
}

export interface UpdateResourceParams {
  id: string;
  updates: Partial<LearningResource>;
}

export interface DeleteResourceParams {
  id: string;
  userId?: string;
}

// ============================================================================
// DATABASE INTERFACES
// ============================================================================

export interface DatabaseLearningResource {
  id: string;
  user_id: string;
  title: string;
  author: string;
  type: ResourceType;
  duration: number;
  progress: number;
  status: ResourceStatus;
  notes: string;
  date_added: string;
  emoji?: string;
  image_url?: string;
  description?: string;
  page_count?: number;
  published_date?: string;
  isbn?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  duration: number;
  progress: number;
  status: ResourceStatus;
  notes: string;
  date_added: string;
  page_count?: number;
  published_date?: string;
  isbn?: string;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface AddBookResponse {
  success: boolean;
  book: Book;
  message: string;
}

export interface ResourceResponse {
  success: boolean;
  resource: LearningResource;
  message: string;
}

export interface ResourceListResponse {
  success: boolean;
  resources: LearningResource[];
  total: number;
  page: number;
  limit: number;
}

export interface ResourceErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// ============================================================================
// EXTERNAL API INTERFACES
// ============================================================================

export interface GoogleBookResult {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  pageCount?: number;
  publishedDate?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

export interface GoogleBooksSearchResponse {
  items?: Array<{
    volumeInfo: GoogleBookResult;
  }>;
  totalItems: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ResourceType = 'book' | 'podcast' | 'course' | 'video' | 'article';

export type ResourceStatus = 'not-started' | 'in-progress' | 'completed';

export type ResourceCategory = 'business' | 'marketing' | 'leadership' | 'personal-development' | 'other';

// ============================================================================
// CONSTANTS
// ============================================================================

export const RESOURCE_TYPES = [
  { key: 'book', label: 'Book', emoji: '📚' },
  { key: 'podcast', label: 'Podcast', emoji: '🎧' },
  { key: 'course', label: 'Course', emoji: '🎓' },
  { key: 'video', label: 'Video', emoji: '📺' },
  { key: 'article', label: 'Article', emoji: '📰' },
] as const;

export const RESOURCE_STATUSES = [
  { key: 'not-started', label: 'Not Started' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
] as const;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ResourceValidationRules {
  title: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  author: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  duration: {
    min: number;
    max: number;
  };
  progress: {
    min: number;
    max: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// SEARCH AND FILTER INTERFACES
// ============================================================================

export interface ResourceSearchParams {
  query: string;
  type?: ResourceType;
  status?: ResourceStatus;
  author?: string;
  minDuration?: number;
  maxDuration?: number;
}

export interface ResourceFilterOptions {
  types: ResourceType[];
  statuses: ResourceStatus[];
  authors: string[];
  durationRange: [number, number];
}

export interface ResourceSortOptions {
  field: 'title' | 'author' | 'dateAdded' | 'progress' | 'duration';
  direction: 'asc' | 'desc';
} 