import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runLeadIntelligence } from '../api/leadsApi';
import { Lead } from '../types';

export function useRunIntelligenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: number) => runLeadIntelligence(leadId),
    onSuccess: (result, leadId) => {
      queryClient.setQueryData<Lead[]>(['leads', ''], (old = []) =>
        old.map((lead) => {
          if (lead.id === leadId) {
            return {
              ...lead,
              insights: result.insights,
              qualificationScore: result.qualificationScore || lead.qualificationScore,
              hasIntelligence: true,
            };
          }
          return lead;
        })
      );
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
