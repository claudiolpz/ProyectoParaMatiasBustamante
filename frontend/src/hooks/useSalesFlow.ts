import { useCallback } from 'react';
import { toast } from 'sonner';
import { useSales } from './useSales';
import {
  showQuantitySelectionModal,
  showConfirmationModal,
  showSuccessModal,
  showErrorModal
} from '../utils/productModals';
import type { Product } from '../types';

interface UseSalesFlowProps {
  products: Product[] | undefined;
  onRefresh: () => void;
}

export const useSalesFlow = ({ products, onRefresh }: UseSalesFlowProps) => {
  const { sellProduct, loading } = useSales();

  const handleSell = useCallback(async (productId: number) => {
    try {
      // 1. Buscar producto
      const product = products?.find(p => p.id === productId);
      if (!product) {
        toast.error('Producto no encontrado');
        return;
      }

      // 2. Validar stock
      if (product.stock === 0) {
        toast.error('No hay stock disponible para este producto');
        return;
      }

      // 3. Mostrar modal de selección de cantidad
      const confirmedQuantity = await showQuantitySelectionModal(product);
      if (!confirmedQuantity) return;

      // 4. Mostrar modal de confirmación
      const isConfirmed = await showConfirmationModal(product, confirmedQuantity);
      if (!isConfirmed) return;

      // 5. Procesar venta
      const result = await sellProduct({
        productId,
        quantity: confirmedQuantity
      });

      // 6. Mostrar resultado exitoso
      await showSuccessModal(result);

      // 7. Refrescar lista
      onRefresh();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Error al procesar la venta';
      toast.error(errorMessage);
      await showErrorModal(errorMessage);
    }
  }, [products, sellProduct, onRefresh]);

  return {
    handleSell,
    loading
  };
};