import type { Product } from '../types';

// Helper para determinar el estilo del botón de venta
export const getSellButtonStyle = (product: Product, sellLoading: boolean): string => {
  if (sellLoading) {
    return 'text-gray-400 bg-gray-600 border-gray-500 cursor-not-allowed animate-pulse';
  }
  if (product.stock === 0 || !product.isActive) {
    return 'text-gray-400 bg-gray-600 border-gray-500 cursor-not-allowed';
  }
  return 'text-green-400 hover:bg-slate-600 hover:text-green-300 border-slate-500 hover:border-green-400';
};

// Helper para determinar el título del botón de venta
export const getSellButtonTitle = (product: Product, sellLoading?: boolean): string => {
  if (sellLoading) return "Procesando venta...";
  if (!product.isActive) return "Producto inactivo";
  if (product.stock === 0) return "Sin stock disponible";
  return "Vender producto";
};

// Helper para determinar el estilo del botón toggle
export const getToggleButtonStyle = (product: Product, toggleLoading: boolean): string => {
  if (toggleLoading) {
    return 'text-gray-400 bg-gray-600 border-gray-500 cursor-not-allowed';
  }
  return product.isActive
    ? 'text-red-400 hover:bg-slate-600 hover:text-red-300 border-slate-500 hover:border-red-400'
    : 'text-green-400 hover:bg-slate-600 hover:text-green-300 border-slate-500 hover:border-green-400';
};

// Helper para determinar el título del botón toggle
export const getToggleButtonTitle = (product: Product, toggleLoading: boolean): string => {
  if (toggleLoading) return "Cambiando estado...";
  return product.isActive ? "Desactivar producto" : "Activar producto";
};


// Helper para determinar si el botón de venta debe estar deshabilitado
export const isSellButtonDisabled = (product: Product, sellLoading: boolean): boolean => {
  return sellLoading || product.stock === 0 || !product.isActive;
};

// Helper para obtener el estilo de fila según estado del producto
export const getProductRowStyle = (product: Product): string => {
  return `transition-colors ${product.isActive
      ? 'hover:bg-slate-600'
      : 'bg-slate-600/50 hover:bg-slate-600/70 opacity-75'
    }`;
};



// Helper alternativo más granular si prefieres mayor control
export const getStockBadgeStyleDetailed = (product: Product): string => {
  const hasStock = product.stock > 0;
  const isActive = product.isActive;

  if (hasStock && isActive) {
    return 'bg-green-900 text-green-300 border border-green-700';
  }

  if (hasStock && !isActive) {
    return 'bg-green-900/50 text-green-400/70 border border-green-700/50';
  }

  if (!hasStock && isActive) {
    return 'bg-red-900 text-red-300 border border-red-700';
  }

  // !hasStock && !isActive
  return 'bg-red-900/50 text-red-400/70 border border-red-700/50';
};

// Helper para obtener estilos de elementos generales según estado del producto
export const getProductElementStyle = (product: Product, activeStyle: string, inactiveStyle: string): string => {
  return product.isActive ? activeStyle : inactiveStyle;
};

// Helper para determinar el estilo del botón de imagen
export const getImageButtonStyle = (product: Product): string => {
  return `w-16 h-16 sm:w-20 sm:h-20 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 p-0 ${product.isActive
      ? 'border-slate-500 hover:border-slate-400 hover:shadow-lg'
      : 'border-slate-600 hover:border-slate-500 opacity-75'
    }`;
};

// Helper para el placeholder de imagen sin foto
export const getImagePlaceholderStyle = (product: Product): string => {
  return `w-16 h-16 sm:w-20 sm:h-20 bg-slate-600 rounded-lg flex items-center justify-center border ${product.isActive ? 'border-slate-500' : 'border-slate-600 opacity-75'
    }`;
};