import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleService } from '../services/article.service';
import type { CreateArticleDto, UpdateArticleDto } from '../models/api.model';

export function useMyArticles(params?: any) {
  return useQuery({
    queryKey: ['doctor', 'articles', params],
    queryFn: () => articleService.getMyArticles(params),
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleDto) => articleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'articles'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateArticleDto }) => articleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'articles'] });
    },
  });
}

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => articleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'articles'] });
    },
  });
};

export const useSubmitArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => articleService.submitArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'articles'] });
    },
  });
};
