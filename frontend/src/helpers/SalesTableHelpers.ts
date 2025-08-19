
// Helper para estilo de fila 
export const getSaleRowStyle = (): string => {
  return 'hover:bg-slate-600 transition-colors';
};

// Helper para estilo del botón de imagen
export const getSaleImageButtonStyle = (): string => {
  return 'w-16 h-16 rounded-lg border border-slate-500 hover:border-slate-400 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 p-0';
};

// Helper para placeholder de imagen
export const getSaleImagePlaceholderStyle = (): string => {
  return 'w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center border border-slate-500';
};

// Helper para elementos según estado
export const getSaleElementStyle = (isHighlight: boolean, normalStyle: string, highlightStyle: string): string => {
  return isHighlight ? highlightStyle : normalStyle;
};

// Helper para formatear fecha
export const formatSaleDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper para formatear precio
export const formatSalePrice = (price: number): string => {
  return `$${price.toLocaleString('es-CL')}`;
};