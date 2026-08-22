import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Lead } from '../types';

export function useScoreLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: number) => {
      const data = await apiClient.post<{ lead_score: number; conversion_probability: number }>(
        `/leads/${leadId}/score`
      );
      return data;
    },
    onSuccess: (data, leadId) => {
      queryClient.setQueryData<Lead[]>(['leads', ''], (old = []) =>
        old.map((lead) => {
          if (lead.id === leadId) {
            return {
              ...lead,
              qualificationScore: data.lead_score,
            };
          }
          return lead;
        })
      );
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
