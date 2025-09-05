import { useCallback } from "react";
import Swal from "sweetalert2"; // Agregar esta importación

export function useSwalAlerts() {
    const showLoadingSwal = useCallback((isEditing: boolean) => {
        Swal.fire({
            title: isEditing ? 'Actualizando producto...' : 'Creando producto...',
            html: `
                <div class="flex flex-col items-center py-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p class="text-gray-600">Procesando información...</p>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            showConfirmButton: false,
            background: '#fff',
            customClass: {
                popup: 'rounded-lg shadow-xl',
                htmlContainer: 'p-0'
            }
        });
    }, []);

    const showResultSwal = useCallback((success: boolean, isEditing: boolean, message = '') => {
        let defaultMessage;
        if (success) {
            defaultMessage = `Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`;
        } else {
            defaultMessage = `Error al ${isEditing ? 'actualizar' : 'crear'} el producto`;
        }

        Swal.fire({
            title: success ? '¡Éxito!' : 'Error',
            text: message || defaultMessage,
            icon: success ? 'success' : 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3B82F6',
            timer: success ? 3000 : undefined,
            timerProgressBar: success,
            customClass: {
                popup: 'rounded-lg shadow-xl'
            }
        });
    }, []);

    const confirmarCerrarSesion = async () => {
        return await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres cerrar tu sesión actual?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626', // red-600
            cancelButtonColor: '#6b7280', // gray-500
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: '#ffffff',
            color: '#1f2937', // gray-800
            customClass: {
                popup: 'rounded-lg shadow-xl select-none',
                title: 'text-lg font-semibold',
                htmlContainer: 'text-sm text-gray-600',
                confirmButton: 'px-4 py-2 rounded-md font-medium',
                cancelButton: 'px-4 py-2 rounded-md font-medium'
            },
            buttonsStyling: true
        });

    };



    return { showLoadingSwal, showResultSwal, confirmarCerrarSesion };
}