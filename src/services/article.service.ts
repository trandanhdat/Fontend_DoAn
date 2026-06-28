import { axiosInstance } from "../utils/axios.config";
import type { PagedResult, ArticleSummaryDto, ArticleDetailDto } from "../models/api.model";

export const articleService = {
  getPublished: async (params?: any): Promise<PagedResult<ArticleSummaryDto>> => {
    const response = await axiosInstance.get<PagedResult<ArticleSummaryDto>>('/article', { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ArticleDetailDto> => {
    const response = await axiosInstance.get<ArticleDetailDto>(`/article/${slug}`);
    return response.data;
  },

  getByIdForEdit: async (id: number): Promise<ArticleDetailDto> => {
    const response = await axiosInstance.get<ArticleDetailDto>(`/article/detail/${id}`);
    return response.data;
  },

  // ─── DOCTOR ──────────────────────────────────────────────────────────────
  getMyArticles: async (params?: any): Promise<PagedResult<ArticleSummaryDto>> => {
    const response = await axiosInstance.get<PagedResult<ArticleSummaryDto>>('/article/my-articles', { params });
    return response.data;
  },

  create: async (data: any): Promise<ArticleDetailDto> => {
    const response = await axiosInstance.post<ArticleDetailDto>('/article', data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<ArticleDetailDto> => {
    const response = await axiosInstance.put<ArticleDetailDto>(`/article/${id}`, data);
    return response.data;
  },

  submitArticle: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/article/${id}/submit`);
  },

  uploadImage: async (file: File): Promise<{ relativePath: string; absoluteUrl: string }> => {
    const formData = new FormData();
    formData.append('File', file);
    const response = await axiosInstance.post('/files/upload-image?folder=articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ─── ADMIN ──────────────────────────────────────────────────────────────
  getAdminAll: async (params?: any): Promise<PagedResult<ArticleSummaryDto>> => {
    // Backend API cho admin lấy tất cả bài viết
    const response = await axiosInstance.get<PagedResult<ArticleSummaryDto>>('/article/admin/all', { params });
    return response.data;
  },

  publish: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/article/${id}/publish`);
  },

  reject: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/article/${id}/reject`);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/article/${id}`);
  }
};
