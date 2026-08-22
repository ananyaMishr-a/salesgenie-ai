import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, createLead, updateLead, deleteLead } from '../api/leadsApi';
import { Lead } from '../types';

export function useLeadsQuery(searchQuery: string = '') {
  return useQuery<Lead[], Error>({
    queryKey: ['leads', searchQuery],
    queryFn: () => fetchLeads(searchQuery),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newLeadData: Partial<Lead>) => createLead(newLeadData),
    onSuccess: (savedLead) => {
      queryClient.setQueryData<Lead[]>(['leads', ''], (old = []) => [savedLead, ...old]);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: Partial<Lead> }) => updateLead(id, values),
    onSuccess: (updatedLead) => {
      queryClient.setQueryData<Lead[]>(['leads', ''], (old = []) =>
        old.map((l) => (l.id === updatedLead.id ? updatedLead : l))
      );
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLead(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads', '']);
      if (previousLeads) {
        queryClient.setQueryData<Lead[]>(
          ['leads', ''],
          previousLeads.filter((l) => l.id !== deletedId)
        );
      }
      return { previousLeads };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', ''], context.previousLeads);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
