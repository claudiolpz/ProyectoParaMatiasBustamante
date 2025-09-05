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
    const [showNewBrandInput, setShowNewBrandInput] = useState(false);

    const initialValues: CreateProductForm = {
        name: "",
        price: undefined,
        stock: undefined,
        categoryId: undefined,
        categoryName: "",
        brandId: undefined,
        brandName: "",
        image: undefined
    };

    const form = useForm({ defaultValues: initialValues });
    const { register, reset, handleSubmit, watch, setValue, getValues, formState: { errors } } = form;
    const watchCategoryId = watch("categoryId");
    const watchBrandId = watch("brandId");

    // Llenar formulario cuando se carga el producto
    useEffect(() => {
        if (isEditing && initialProduct) {
            reset({
                name: initialProduct.name,
                price: initialProduct.price,
                stock: initialProduct.stock,
                brandId: initialProduct.brand?.id?.toString() || undefined,
                brandName: initialProduct.brand?.name || undefined,
                categoryId: initialProduct.category?.id?.toString() || undefined,
                categoryName: initialProduct.category?.name || undefined,
                image: undefined,
                isActive: initialProduct.isActive || false
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

    // Manejar cambio de marca
    useEffect(() => {
        if (watchBrandId === "0") {
            setShowNewBrandInput(true);
        } else {
            setShowNewBrandInput(false);
            setValue("brandName", "");
        }
    }, [watchBrandId, setValue]);

    // Función para resetear completamente el formulario
    const resetFormCompletely = () => {
        if (isEditing && initialProduct) {
            reset({
                name: initialProduct.name,
                price: initialProduct.price,
                stock: initialProduct.stock,
                categoryId: initialProduct.category?.id?.toString() || undefined,
                categoryName: "",
                brandId: initialProduct.brand?.id?.toString() || undefined,
                brandName: "",
                image: undefined
            });
        } else {
            reset(initialValues);
        }

        setShowNewCategoryInput(false);
        setShowNewBrandInput(false);
        clearFileInput();
    };

    // Función para manejar submit
    const handleSubmitProduct = async (formData: CreateProductForm): Promise<boolean> => {
        try {
            // Usar el prepareProductFormData directamente
            const productData = prepareProductFormData(formData);

            // Si hay transactionId en formData, agregarlo
            if (formData.transactionId) {
                productData.append('transactionId', formData.transactionId);
            }
            const response = isEditing && productId
                ? await updateProduct(productId, productData)
                : await createProduct(productData);

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
        showNewBrandInput,
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