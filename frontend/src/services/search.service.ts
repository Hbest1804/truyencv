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
    const response = await api.get('/search', { params });
    return response.data;
  },

  getSuggestions: async (q: string) => {
    const response = await api.get('/search/suggestions', { params: { q } });
    return response.data;
  }
};

