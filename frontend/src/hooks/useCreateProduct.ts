import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { toast } from 'sonner';
import type { CreateProductForm, Category } from "../types";
import api from "../config/axios";

export const useCreateProduct = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    const initialValues: CreateProductForm = {
        name: "",
        price: undefined,
        stock: undefined,
        sku: "",
        categoryId: undefined,
        categoryName: "",
        image: undefined
    };

    const form = useForm({ defaultValues: initialValues });
    const { register, reset, handleSubmit, watch, setValue, getValues, formState: { errors } } = form;
    const watchCategoryId = watch("categoryId");

    // Cargar categorías
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const { data } = await api.get('/categories');
                setCategories(data.categories || data);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                toast.error('Error al cargar categorías');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Manejar cambio de categoría
    useEffect(() => {
        if (watchCategoryId === "0") {
            setShowNewCategoryInput(true);
        } else {
            setShowNewCategoryInput(false);
            setValue("categoryName", "");
        }
    }, [watchCategoryId, setValue]);

    // Helper function to prepare FormData
    const prepareProductData = (formData: CreateProductForm): FormData => {
        const productData = new FormData();

        console.log('FormData recibida:', formData);

        productData.append('name', formData.name);

        if (formData.price !== undefined) {
            productData.append('price', formData.price.toString());
        }

        if (formData.stock !== undefined) {
            productData.append('stock', formData.stock.toString());
        }

        if (formData.sku) {
            productData.append('sku', formData.sku);
        }

        if (formData.categoryId && formData.categoryId !== "0" && Number(formData.categoryId) > 0) {
            productData.append('categoryId', formData.categoryId.toString());
        } else if (formData.categoryName) {
            productData.append('categoryName', formData.categoryName);
        }

        // Obtener el archivo directamente del input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        console.log('Archivo del input:', file);

        if (file) {
            productData.append('image', file);
            console.log('Archivo agregado al FormData:', file.name);
        } else {
            console.log('No se encontró archivo para subir');
        }

        return productData;
    };

    // CORREGIDO: Función para resetear completamente el formulario
    const resetFormCompletely = () => {
        reset();
        setShowNewCategoryInput(false);

        // Limpiar el input de archivo manualmente
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // CORREGIDO: Crear producto - ahora retorna boolean para indicar éxito
    const handleCreateProduct = async (formData: CreateProductForm): Promise<boolean> => {
        try {
            console.log('Iniciando creación de producto...');
            const productData = prepareProductData(formData);

            console.log('Enviando datos al servidor...');
            const { data } = await api.post(`/products`, productData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Respuesta del servidor:', data);
            toast.success(data.message);

            // Reset form completamente
            resetFormCompletely();

            return true; // Éxito

        } catch (error) {
            console.error('Error al crear producto:', error);
            if (isAxiosError(error) && error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                if (error.response.data.error) {
                    toast.error(error.response.data.error);
                }
                if (error.response.data.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        if (err.msg) toast.error(err.msg);
                    });
                }
            } else {
                toast.error('Error inesperado al crear el producto');
            }
            return false; // Error
        }
    };

    return {
        form: { register, handleSubmit, errors, getValues, setValue, watch },
        categories,
        loadingCategories,
        showNewCategoryInput,
        handleCreateProduct,
        resetForm: resetFormCompletely // AGREGADO: exportar función de reset
    };
};