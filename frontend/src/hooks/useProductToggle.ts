import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import api from '../config/axios';
import type { ToggleProductStatusData, ToggleProductStatusResponse } from '../types';


export const useProductToggle = () => {
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async (data: ToggleProductStatusData): Promise<ToggleProductStatusResponse> => {
      const response = await api.patch(`/products/${data.productId}/toggle-status`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response) {
        toast.error(error.response.data.error || 'Error al cambiar estado del producto');
      } else {
        toast.error('Error de conexión');
      }
    }
  });

  return {
    toggleStatus: toggleStatusMutation.mutateAsync,
    loading: toggleStatusMutation.isPending
  };
};