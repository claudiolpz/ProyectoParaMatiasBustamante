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
        price: 0,
        stock: 0,
        sku: "",
        categoryId: undefined,
        categoryName: "",
        image: undefined
    };

    const form = useForm({ defaultValues: initialValues });
    const { register, reset, handleSubmit, watch, setValue, formState: { errors } } = form;
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

    // Crear producto
    const handleCreateProduct = async (formData: CreateProductForm) => {
        try {
            const productData = new FormData();

            productData.append('name', formData.name);
            productData.append('price', formData.price.toString());
            productData.append('stock', formData.stock.toString());

            if (formData.sku) {
                productData.append('sku', formData.sku);
            }

            if (formData.categoryId && formData.categoryId !== "0" && Number(formData.categoryId) > 0) {
                productData.append('categoryId', formData.categoryId.toString());
            } else if (formData.categoryName) {
                productData.append('categoryName', formData.categoryName);
            }

            if (formData.image?.[0]) {
                productData.append('image', formData.image[0]);
            }

            const { data } = await api.post(`/products`, productData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(data.message);
            reset();
            setShowNewCategoryInput(false);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                if (error.response.data.error) {
                    toast.error(error.response.data.error);
                }
                if (error.response.data.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        if (err.msg) toast.error(err.msg);
                    });
                }
            }
        }
    };

    return {
        form: { register, handleSubmit, errors },
        categories,
        loadingCategories,
        showNewCategoryInput,
        handleCreateProduct
    };
};