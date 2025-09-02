import { useEffect, useState } from 'react';

/**
 * Hook personalizado para implementar debouncing
 * @param value - El valor que queremos debounce
 * @param delay - El delay en milisegundos (por defecto 500ms)
 * @returns El valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Inicializar el estado inmediatamente si es el primer valor
        if (debouncedValue === undefined) {
            setDebouncedValue(value);
            return;
        }

        // Establecer un timer que actualice el valor debounced después del delay
        const handler = setTimeout(() => {
            if (value !== debouncedValue) {
                setDebouncedValue(value);
            }
        }, delay);

        // Limpiar el timer si el valor cambia antes de que se ejecute
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay, debouncedValue]);

    return debouncedValue;
}
