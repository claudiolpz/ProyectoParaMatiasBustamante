import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchCategories, fetchProductById } from '../services/productService';
import type { Category, Product } from '../types';

export const useProductData = (productId?: string) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [initialProduct, setInitialProduct] = useState<Product | null>(null);

    const isEditing = Boolean(productId);

    // Cargar categorías
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    // Cargar producto para edición
    useEffect(() => {
        if (!isEditing || !productId) return;

        const loadProduct = async () => {
            try {
                setLoadingProduct(true);
                const product = await fetchProductById(productId);
                setInitialProduct(product);
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setLoadingProduct(false);
            }
        };
        loadProduct();
    }, [isEditing, productId]);

    return {
        categories,
        loadingCategories,
        loadingProduct,
        initialProduct,
        isEditing
    };
};