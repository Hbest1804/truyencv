export type ViewState = 'home' | 'discover' | 'detail' | 'reader' | 'profile';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genres: string[];
  status: 'Ongoing' | 'Completed';
  chapterCount: number;
  rating?: number;
  views?: string;
  synopsis?: string;
}

export interface Chapter {
  id: string;
  title: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  author: string;
  avatarUrl: string;
  timeAgo: string;
  content: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<{ needsEmailConfirmation: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// ─── Story API Types (mapping from backend v_story_detail) ───────────────────

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Story {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  description: string | null;
  synopsis: string | null;
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  is_published: boolean;
  chapter_count: number;
  view_count: number;
  bookmark_count: number;
  rating_avg: number;
  rating_count: number;
  word_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // From v_story_detail JOIN
  original_author?: string | null;
  author_username: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
  genres: Genre[];
  // Added when user is authenticated
  is_following?: boolean;
  is_favorited?: boolean;
  user_rating?: { score: number; review: string | null } | null;
  // Trending extra field
  views_in_period?: number;
}

export interface StoriesListResult {
  stories: Story[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShareData {
  story_id: string;
  story_title: string;
  story_slug: string;
  share_url: string;
  share_links: {
    general: string;
    facebook: string;
    twitter: string;
    telegram: string;
  };
  og_data: {
    title: string;
    description: string | null;
    image: string | null;
    url: string;
  };
}

export interface RatingData {
  id: string;
  user_id: string;
  story_id: string;
  score: number;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportReason = 'spam' | 'copyright' | 'inappropriate' | 'wrong_category' | 'other';

export interface DbChapter {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  view_count: number;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  reading_progress?: number;
}
