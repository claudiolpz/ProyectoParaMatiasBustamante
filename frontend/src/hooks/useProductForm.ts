import { useProductData } from './useProductData';
import { useProductFormLogic } from './useProductFormLogic';
import type {UseProductFormProps} from '../types';

export const useProductForm = ({ productId, onSuccess }: UseProductFormProps = {}) => {
    // Cargar datos (categorías y producto si es edición)
    const {
        categories,
        loadingCategories,
        loadingProduct,
        brands,
        loadingBrands,
        initialProduct,
        isEditing
    } = useProductData(productId);

    // Lógica del formulario
    const {
        form,
        showNewCategoryInput,
        handleSubmitProduct,
        resetForm
    } = useProductFormLogic({
        initialProduct,
        isEditing,
        productId,
        onSuccess
    });

    return {
        form,
        categories,
        loadingCategories,
        loadingProduct,
        brands,
        loadingBrands,
        showNewCategoryInput,
        handleSubmitProduct,
        resetForm,
        isEditing,
        initialProduct
    };
};