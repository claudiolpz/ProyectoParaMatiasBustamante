import { isAxiosError } from "axios";
import api from "../config/axios";
import type { Product, Category } from "../types";

// Servicio para cargar producto por ID
export const fetchProductById = async (productId: string): Promise<Product> => {
    try {
        const { data } = await api.get(`/products/${productId}`);
        return data.product;
    } catch (error) {
        console.error('Error al cargar producto:', error);
        if (isAxiosError(error) && error.response?.status === 404) {
            throw new Error('Producto no encontrado');
        }
        throw new Error('Error al cargar el producto');
    }
};

// Servicio para cargar categorías
export const fetchCategories = async (): Promise<Category[]> => {
    try {
        const { data } = await api.get('/categories');
        return data.categories || data;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        throw new Error('Error al cargar categorías');
    }
};

// Servicio para crear producto
export const createProduct = async (productData: FormData): Promise<any> => {
    const response = await api.post(`/products`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Servicio para actualizar producto
export const updateProduct = async (productId: string, productData: FormData): Promise<any> => {
    const response = await api.put(`/products/${productId}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};