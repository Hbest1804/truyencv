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
