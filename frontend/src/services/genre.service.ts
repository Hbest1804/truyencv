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
    const response = await api.get('/genres');
    return response.data;
  },

  getStoriesByGenre: async (genreId: string | number, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/genres/${genreId}/stories`, { params });
    return response.data;
  }
};
