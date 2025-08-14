import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { toast } from 'sonner';
import { createProduct, updateProduct } from '../services/productService';
import { prepareProductFormData, clearFileInput } from '../utils/formDataHelpers';
import type { CreateProductForm, UseProductFormLogicProps } from "../types";


export const useProductFormLogic = ({ 
    initialProduct, 
    isEditing, 
    productId, 
    onSuccess 
}: UseProductFormLogicProps) => {
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

    // Llenar formulario cuando se carga el producto
    useEffect(() => {
        if (isEditing && initialProduct) {
            reset({
                name: initialProduct.name,
                price: initialProduct.price,
                stock: initialProduct.stock,
                sku: initialProduct.sku || "",
                categoryId: initialProduct.category?.id?.toString() || undefined,
                categoryName: "",
                image: undefined
            });
        }
    }, [isEditing, initialProduct, reset]);

    // Manejar cambio de categoría
    useEffect(() => {
        if (watchCategoryId === "0") {
            setShowNewCategoryInput(true);
        } else {
            setShowNewCategoryInput(false);
            setValue("categoryName", "");
        }
    }, [watchCategoryId, setValue]);

    // Función para resetear completamente el formulario
    const resetFormCompletely = () => {
        if (isEditing && initialProduct) {
            reset({
                name: initialProduct.name,
                price: initialProduct.price,
                stock: initialProduct.stock,
                sku: initialProduct.sku || "",
                categoryId: initialProduct.category?.id?.toString() || undefined,
                categoryName: "",
                image: undefined
            });
        } else {
            reset(initialValues);
        }
        
        setShowNewCategoryInput(false);
        clearFileInput();
    };

    // Función para manejar submit
    const handleSubmitProduct = async (formData: CreateProductForm): Promise<boolean> => {
        try {
            console.log(`Iniciando ${isEditing ? 'edición' : 'creación'} de producto...`);
            
            const productData = prepareProductFormData(formData);
            console.log('Enviando datos al servidor...');
            
            const response = isEditing && productId 
                ? await updateProduct(productId, productData)
                : await createProduct(productData);

            console.log('Respuesta del servidor:', response);
            toast.success(response.message);

            if (onSuccess) {
                onSuccess();
            }

            if (!isEditing) {
                resetFormCompletely();
            }

            return true;

        } catch (error) {
            console.error(`Error al ${isEditing ? 'editar' : 'crear'} producto:`, error);
            handleSubmitError(error, isEditing);
            return false;
        }
    };

    return {
        form: { register, handleSubmit, errors, getValues, setValue, watch, reset },
        showNewCategoryInput,
        handleSubmitProduct,
        resetForm: resetFormCompletely
    };
};

// Función auxiliar para manejo de errores
const handleSubmitError = (error: any, isEditing: boolean): void => {
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
        toast.error(`Error inesperado al ${isEditing ? 'editar' : 'crear'} el producto`);
    }
};