import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '../services/specialty.service';
import { articleService } from '../services/article.service';

export function useSpecialties() {
  return useQuery({
    queryKey: ['public', 'specialties'],
    queryFn: () => specialtyService.getAllActive(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePublishedArticles(params?: any) {
  return useQuery({
    queryKey: ['public', 'articles', params],
    queryFn: () => articleService.getPublished(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticleDetail(slug: string) {
  return useQuery({
    queryKey: ['public', 'article', slug],
    queryFn: () => articleService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
