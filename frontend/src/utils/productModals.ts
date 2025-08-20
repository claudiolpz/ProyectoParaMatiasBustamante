import Swal from 'sweetalert2';
import type { Product } from '../types';

// Configuración de estilos para los modales
const MODAL_STYLES = {
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    gray: '#6b7280',
  },
  width: '500px'
};

// Modal para seleccionar cantidad
export const showQuantitySelectionModal = async (product: Product): Promise<number | null> => {
  const initialQuantity = 1;

  const { value: confirmedQuantity, isConfirmed } = await Swal.fire({
    title: `Vender: ${product.name}`,
    html: createQuantitySelectionHTML(product, initialQuantity),
    showCancelButton: true,
    confirmButtonText: 'Proceder con la venta',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: MODAL_STYLES.colors.primary,
    cancelButtonColor: MODAL_STYLES.colors.gray,
    width: MODAL_STYLES.width,
    preConfirm: () => validateQuantityInput(product),
    didOpen: () => setupQuantityControls(product)
  });

  return isConfirmed ? confirmedQuantity : null;
};

// Modal de confirmación final
export const showConfirmationModal = async (
  product: Product,
  quantity: number
): Promise<boolean> => {
  const total = product.price * quantity;

  const { isConfirmed } = await Swal.fire({
    title: '¿Confirmar venta?',
    html: createConfirmationHTML(product, quantity, total),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirmar venta',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: MODAL_STYLES.colors.success,
    cancelButtonColor: MODAL_STYLES.colors.gray,
  });

  return isConfirmed;
};

// Modal de resultado exitoso
export const showSuccessModal = async (result: any): Promise<void> => {
  await Swal.fire({
    title: '¡Venta realizada con éxito!',
    html: createSuccessHTML(result),
    icon: 'success',
    confirmButtonText: 'Continuar',
    confirmButtonColor: MODAL_STYLES.colors.success,
  });
};

// Modal de error
export const showErrorModal = async (errorMessage: string): Promise<void> => {
  await Swal.fire({
    title: 'Error en la venta',
    text: errorMessage,
    icon: 'error',
    confirmButtonText: 'Entendido',
    confirmButtonColor: MODAL_STYLES.colors.error,
  });
};

// Funciones auxiliares para crear HTML
const createQuantitySelectionHTML = (product: Product, quantity: number): string => `
  <div class="space-y-4">
    <div class="bg-gray-50 p-4 rounded-lg">
      <p class="text-gray-700"><strong>Stock Disponible:</strong> ${product.stock} Unidades</p>
      <p class="text-gray-700"><strong>Precio Unidad:</strong> $${product.price.toLocaleString('es-CL')} CLP</p>
    </div>
    
    <div class="flex items-center justify-center space-x-4">
      <button 
        type="button" 
        id="decrease-btn" 
        class="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
        ${quantity <= 1 ? 'disabled' : ''}
      >
        -
      </button>
      
      <div class="text-center">
        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad a vender</label>
        <input 
          type="number" 
          id="quantity-input" 
          class="w-20 text-center text-lg font-semibold border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value="${quantity}" 
          min="1" 
          max="${product.stock}"
        />
      </div>
      
      <button 
        type="button" 
        id="increase-btn" 
        class="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        ${quantity >= product.stock ? 'disabled' : ''}
      >
        +
      </button>
    </div>
    
    <div id="total-price" class="text-center text-lg font-semibold text-blue-600">
      Total: $${(product.price * quantity).toLocaleString('es-CL')}
    </div>
  </div>
`;

const createConfirmationHTML = (product: Product, quantity: number, total: number): string => `
  <div class="space-y-4">
    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
      <h3 class="font-semibold text-blue-800 mb-2">Resumen de la venta</h3>
      <div class="text-left space-y-1">
        <p><strong>Producto:</strong> ${product.name}</p>
        <p><strong>Cantidad:</strong> ${quantity} unidad${quantity > 1 ? 'es' : ''}</p>
        <p><strong>Precio unitario:</strong> $${product.price.toLocaleString('es-CL')} CLP</p>
        <p class="text-lg"><strong>Total:</strong> $${total.toLocaleString('es-CL')} CLP</p>
      </div>
    </div>
    <p class="text-gray-600">Esta acción reducirá el stock del producto.</p>
  </div>
`;


const createSuccessHTML = (result: any): string => `
  <div class="space-y-3">
    <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
      <h3 class="font-semibold text-green-800 mb-2">${result.message}</h3>
      <div class="text-left space-y-1 text-sm">
        <p><strong>Producto:</strong> ${result.product.name}</p>
        <p><strong>Cantidad vendida:</strong> ${result.sale.quantity}</p>
        <p><strong>Stock anterior:</strong> ${result.product.previousStock}</p>
        <p><strong>Stock actual:</strong> ${result.product.newStock}</p>
        <p><strong>Precio unidad:</strong> $${result.sale.unitPrice}</p>
        <p><strong>Precio total:</strong> $${result.sale.totalPrice}</p>
      </div>
    </div>
  </div>
`;

// Validar entrada de cantidad
const validateQuantityInput = (product: Product): number | false => {
  const input = document.getElementById('quantity-input') as HTMLInputElement;
  const value = parseInt(input.value);

  if (isNaN(value) || value < 1) {
    Swal.showValidationMessage('La cantidad debe ser mayor a 0');
    return false;
  }

  if (value > product.stock) {
    Swal.showValidationMessage(`La cantidad no puede ser mayor al stock disponible (${product.stock})`);
    return false;
  }

  return value;
};

// Configurar controles de cantidad
const setupQuantityControls = (product: Product): void => {
  const decreaseBtn = document.getElementById('decrease-btn') as HTMLButtonElement;
  const increaseBtn = document.getElementById('increase-btn') as HTMLButtonElement;
  const quantityInput = document.getElementById('quantity-input') as HTMLInputElement;
  const totalPrice = document.getElementById('total-price') as HTMLElement;

  const updateUI = () => {
    const currentQuantity = parseInt(quantityInput.value) || 1;

    // Actualizar estado de botones
    decreaseBtn.disabled = currentQuantity <= 1;
    increaseBtn.disabled = currentQuantity >= product.stock;

    // Actualizar clases CSS
    decreaseBtn.className = `w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${currentQuantity <= 1
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-red-500 text-white hover:bg-red-600'
      }`;

    increaseBtn.className = `w-10 h-10 rounded-lg transition-colors flex items-center justify-center ${currentQuantity >= product.stock
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-green-500 text-white hover:bg-green-600'
      }`;

    // Actualizar precio total
    totalPrice.innerHTML = `Total: $${(product.price * currentQuantity).toLocaleString('es-CL')} CLP`;
  };

  // Event listeners
  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value) || 1;
    if (current > 1) {
      quantityInput.value = (current - 1).toString();
      updateUI();
    }
  });

  increaseBtn.addEventListener('click', () => {
    const current = parseInt(quantityInput.value) || 1;
    if (current < product.stock) {
      quantityInput.value = (current + 1).toString();
      updateUI();
    }
  });

  quantityInput.addEventListener('input', updateUI);

  // Inicializar UI
  updateUI();
};

// Modal de confirmación para eliminar producto
export const showDeleteConfirmationModal = async (product: Product): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar producto?',
    html: createDeleteConfirmationHTML(product),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: MODAL_STYLES.colors.error,
    cancelButtonColor: MODAL_STYLES.colors.gray,
    focusCancel: true, // Enfoca el botón cancelar por seguridad
  });

  return isConfirmed;
};

// Modal de eliminación exitosa
export const showDeleteSuccessModal = async (result: any): Promise<void> => {
  await Swal.fire({
    title: '¡Producto eliminado!',
    html: createDeleteSuccessHTML(result),
    icon: 'success',
    confirmButtonText: 'Continuar',
    confirmButtonColor: MODAL_STYLES.colors.success,
  });
};

// Función para crear HTML de confirmación de eliminación
const createDeleteConfirmationHTML = (product: Product): string => `
  <div class="space-y-4">
    <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
      <h3 class="font-semibold text-red-800 mb-2">⚠️ Esta acción no se puede deshacer</h3>
      <div class="text-left space-y-2">
        <p><strong>Producto a eliminar:</strong> ${product.name}</p>
        ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ''}
        <p><strong>Categoría:</strong> ${product.category?.name || 'Sin categoría'}</p>
        <p><strong>Stock actual:</strong> ${product.stock} unidades</p>
        <p><strong>Precio:</strong> $${product.price.toLocaleString('es-CL')} CLP</p>
      </div>
    </div>
    <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <p class="text-yellow-700 text-sm">
        <strong>Advertencia:</strong> Se perderán todos los datos asociados a este producto.
      </p>
    </div>
  </div>
`;

// Función para crear HTML de eliminación exitosa
const createDeleteSuccessHTML = (result: any): string => `
  <div class="space-y-3">
    <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
      <h3 class="font-semibold text-green-800 mb-2">${result.message}</h3>
      <div class="text-left text-sm">
        <p><strong>Producto eliminado:</strong> ${result.product.name}</p>
        <p class="text-green-600 mt-2">El producto ha sido removido permanentemente del sistema.</p>
      </div>
    </div>
  </div>
`;


// Modal de confirmación para toggle de estado
export const showToggleConfirmationModal = (product: Product): Promise<boolean> => {
  const actionUpper = product.isActive ? 'Desactivar' : 'Activar';

  return Swal.fire({
    title: `${actionUpper} Producto`,
    html: createToggleConfirmationHTML(product),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: actionUpper,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: product.isActive ? MODAL_STYLES.colors.error : MODAL_STYLES.colors.success,
    cancelButtonColor: MODAL_STYLES.colors.gray,
    focusCancel: true,
    customClass: {
    popup: 'select-none' 
  }
  }).then(result => result.isConfirmed);
};

// Modal de éxito para toggle
export const showToggleSuccessModal = (result: any): Promise<void> => {
  return Swal.fire({
    title: 'Estado Actualizado',
    html: createToggleSuccessHTML(result),
    icon: 'success',
    confirmButtonText: 'Entendido',
    confirmButtonColor: MODAL_STYLES.colors.success,
    customClass: {
    popup: 'select-none' 
  }
  }).then(() => { });
};

// Función para crear HTML de confirmación de toggle
const createToggleConfirmationHTML = (product: Product): string => {
  const action = product.isActive ? 'desactivar' : 'activar';
  const isActivating = !product.isActive;

  return `
    <div class="space-y-4">
      <div class="bg-${isActivating ? 'green' : 'orange'}-50 p-4 rounded-lg border-l-4 border-${isActivating ? 'green' : 'orange'}-400">
        <h3 class="font-semibold text-${isActivating ? 'green' : 'orange'}-800 mb-2">
          ¿Confirmar ${action}?
        </h3>
        <div class="text-left space-y-2">
          <p><strong>Producto:</strong> ${product.name}</p>
          ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ''}
          <p><strong>Categoría:</strong> ${product.category?.name || 'Sin categoría'}</p>
          <p><strong>Stock:</strong> ${product.stock} unidades</p>
        </div>
      </div>
      <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p class="text-blue-700 text-sm">
          ${isActivating
      ? '<strong>Al activar:</strong> El producto será visible para todos los usuarios'
      : '<strong>Al desactivar:</strong> El producto solo será visible para administradores'
    }
        </p>
      </div>
    </div>
  `;
};

// Función para crear HTML de éxito del toggle
const createToggleSuccessHTML = (result: any): string => {
  const isNowActive = result.product.isActive;

  return `
    <div class="space-y-3">
      <div class="bg-${isNowActive ? 'green' : 'orange'}-50 p-4 rounded-lg border-l-4 border-${isNowActive ? 'green' : 'orange'}-400">
        <h3 class="font-semibold text-${isNowActive ? 'green' : 'orange'}-800 mb-2">${result.message}</h3>
        <div class="text-left text-sm space-y-1">
          <p><strong>Producto:</strong> ${result.product.name}</p>
          <p class="text-${isNowActive ? 'green' : 'orange'}-600">
            <strong>Estado:</strong> ${isNowActive ? 'Activo (visible para todos)' : 'Inactivo (solo admins)'}
          </p>
        </div>
      </div>
    </div>
  `;
};