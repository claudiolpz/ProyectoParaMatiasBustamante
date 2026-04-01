import { useFetchList } from './useFetchList';
import type { Category } from '../types';

export const useCategories = () => {
    const { items: categories, loading, fetchItems: fetchCategories } = useFetchList<Category>(
        '/categories',
        'categories',
        'Error al cargar las categorías'
    );

    return { categories, loading, fetchCategories };
};
