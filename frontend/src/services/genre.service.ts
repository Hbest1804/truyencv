import api from './api';

export interface Genre {
  id: number;
  name: string;
  slug: string;
  description?: string;
  storyCount?: number;
}

export const genreService = {
  getGenres: async () => {
    return api.get('/genres');
  },

  getStoriesByGenre: async (genreId: string | number, params?: { page?: number; limit?: number }) => {
    return api.get(`/genres/${genreId}/stories`, { params });
  }
};
