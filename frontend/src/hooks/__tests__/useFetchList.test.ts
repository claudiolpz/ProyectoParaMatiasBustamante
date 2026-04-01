import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFetchList } from '../useFetchList';

// Mock de axios y sonner
vi.mock('../../config/axios', () => ({
    default: { get: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import api from '../../config/axios';
import { toast } from 'sonner';

const mockedGet = vi.mocked(api.get);
const mockedToastError = vi.mocked(toast.error);

describe('useFetchList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('inicia con items vacíos y loading en false', () => {
        const { result } = renderHook(() =>
            useFetchList('/categories', 'categories', 'Error al cargar')
        );

        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(false);
    });

    it('activa loading durante el fetch', async () => {
        let resolve: (v: any) => void;
        mockedGet.mockReturnValueOnce(new Promise(r => { resolve = r; }));

        const { result } = renderHook(() =>
            useFetchList('/categories', 'categories', 'Error')
        );

        act(() => { result.current.fetchItems(); });

        expect(result.current.loading).toBe(true);

        await act(async () => { resolve!({ data: { categories: [] } }); });
    });

    it('procesa respuesta con clave específica (dataKey)', async () => {
        const items = [{ id: 1, name: 'Ropa' }, { id: 2, name: 'Calzado' }];
        mockedGet.mockResolvedValueOnce({ data: { categories: items } });

        const { result } = renderHook(() =>
            useFetchList('/categories', 'categories', 'Error')
        );

        await act(async () => { await result.current.fetchItems(); });

        expect(result.current.items).toEqual(items);
        expect(result.current.loading).toBe(false);
    });

    it('procesa respuesta con clave .data como fallback', async () => {
        const items = [{ id: 1, name: 'Nike' }];
        mockedGet.mockResolvedValueOnce({ data: { data: items } });

        const { result } = renderHook(() =>
            useFetchList('/brands', 'brands', 'Error')
        );

        await act(async () => { await result.current.fetchItems(); });

        expect(result.current.items).toEqual(items);
    });

    it('procesa respuesta cuando la data es directamente un array', async () => {
        const items = [{ id: 1, name: 'Item' }];
        mockedGet.mockResolvedValueOnce({ data: items });

        const { result } = renderHook(() =>
            useFetchList('/endpoint', 'key', 'Error')
        );

        await act(async () => { await result.current.fetchItems(); });

        expect(result.current.items).toEqual(items);
    });

    it('llama al endpoint correcto', async () => {
        mockedGet.mockResolvedValueOnce({ data: { brands: [] } });

        const { result } = renderHook(() =>
            useFetchList('/brands', 'brands', 'Error')
        );

        await act(async () => { await result.current.fetchItems(); });

        expect(mockedGet).toHaveBeenCalledWith('/brands');
    });

    it('en caso de error: limpia items, muestra toast y desactiva loading', async () => {
        mockedGet.mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() =>
            useFetchList('/categories', 'categories', 'Error al cargar las categorías')
        );

        await act(async () => { await result.current.fetchItems(); });

        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(mockedToastError).toHaveBeenCalledWith('Error al cargar las categorías');
    });

    it('retorna loading en false después de un fetch exitoso', async () => {
        mockedGet.mockResolvedValueOnce({ data: { categories: [{ id: 1, name: 'Test' }] } });

        const { result } = renderHook(() =>
            useFetchList('/categories', 'categories', 'Error')
        );

        await act(async () => { await result.current.fetchItems(); });

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('ignora respuesta no-array y retorna lista vacía', async () => {
        mockedGet.mockResolvedValueOnce({ data: { categories: 'no-es-array' } });

        const { result } = renderHook(() =>
            useFetchList('/categories', 'categories', 'Error')
        );

        await act(async () => { await result.current.fetchItems(); });

        expect(result.current.items).toEqual([]);
    });
});
