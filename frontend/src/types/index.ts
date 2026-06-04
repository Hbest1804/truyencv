export type ViewState = 'home' | 'discover' | 'detail' | 'reader';

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
  avatar_url?: string;
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
}
