import { useQuery } from '@tanstack/react-query';
import { serviceService } from '../services/service.service';

export const useServicesBySpecialty = (specialtyId?: number) => {
  return useQuery({
    queryKey: ['services', 'specialty', specialtyId],
    queryFn: () => {
      if (!specialtyId) return Promise.resolve([]);
      return serviceService.getBySpecialty(specialtyId);
    },
    enabled: !!specialtyId,
  });
};
