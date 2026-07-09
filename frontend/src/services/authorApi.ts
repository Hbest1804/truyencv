import api from './api';

export const authorApi = {
  // STORIES
  getAuthorStories: () => api.get('/author/stories'),
  
  createStory: (data: { title: string; description: string; genreIds: number[]; status?: string }) => 
    api.post('/author/stories', data),
    
  getStoryDetail: (storyId: number | string) => 
    api.get(`/author/stories/${storyId}`),
    
  updateStory: (storyId: number | string, data: any) => 
    api.put(`/author/stories/${storyId}`, data),
    
  deleteStory: (storyId: number | string) => 
    api.delete(`/author/stories/${storyId}`),
    
  changeStoryStatus: (storyId: number | string, status: string) => 
    api.patch(`/author/stories/${storyId}/status`, { status }),
    
  uploadStoryCover: (storyId: number | string, file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post(`/author/stories/${storyId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // CHAPTERS
  getAuthorChapters: (storyId: number | string) => 
    api.get(`/author/stories/${storyId}/chapters`),
    
  createChapter: (storyId: number | string, data: any) => 
    api.post(`/author/stories/${storyId}/chapters`, data),
    
  getChapterDetail: (storyId: number | string, chapterId: number | string) => 
    api.get(`/author/stories/${storyId}/chapters/${chapterId}`),
    
  updateChapter: (storyId: number | string, chapterId: number | string, data: any) => 
    api.put(`/author/stories/${storyId}/chapters/${chapterId}`, data),
    
  deleteChapter: (storyId: number | string, chapterId: number | string) => 
    api.delete(`/author/stories/${storyId}/chapters/${chapterId}`),
    
  publishChapter: (storyId: number | string, chapterId: number | string) => 
    api.patch(`/author/stories/${storyId}/chapters/${chapterId}/publish`),
    
  scheduleChapter: (storyId: number | string, chapterId: number | string, scheduledAt: string) => 
    api.patch(`/author/stories/${storyId}/chapters/${chapterId}/schedule`, { scheduledAt }),
};
