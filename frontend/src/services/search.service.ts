import api from './api.ts';

import { Story } from '@/types';

export interface AuthorInfo {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role?: string;
}

export interface SearchResult {
  stories: Story[];
  authors: AuthorInfo[];
}

export const searchService = {
  searchGlobal: async (params: { q: string; type?: 'all' | 'story' | 'author'; page?: number; limit?: number }) => {
    return api.get('/search', { params });
  },

  getSuggestions: async (q: string) => {
    return api.get('/search/suggestions', { params: { q } });
  }
};

