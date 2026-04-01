import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../config/axios';

export const useFetchList = <T,>(endpoint: string, dataKey: string, errorMessage: string) => {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);

    const processResponse = useCallback((responseData: unknown): T[] => {
        if (typeof responseData !== 'object' || responseData === null) return [];
        const data = (responseData as Record<string, unknown>)[dataKey]
            ?? (responseData as Record<string, unknown>).data
            ?? responseData;
        return Array.isArray(data) ? data : [];
    }, [dataKey]);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(endpoint);
            setItems(processResponse(response.data));
        } catch {
            setItems([]);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [endpoint, processResponse, errorMessage]);

    return { items, loading, fetchItems };
};
