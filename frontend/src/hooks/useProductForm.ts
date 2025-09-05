import { useProductData } from './useProductData';
import { useProductFormLogic } from './useProductFormLogic';
import type {UseProductFormProps} from '../types';

export const useProductForm = ({ productId, onSuccess }: UseProductFormProps = {}) => {
    // Cargar datos (categorías y producto si es edición)
    const {
        categories,
        loadingCategories,
        brands,
        loadingBrands,
        loadingProduct,
        initialProduct,
        isEditing
    } = useProductData(productId);

    // Lógica del formulario
    const {
        form,
        showNewCategoryInput,
        showNewBrandInput,
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
        showNewBrandInput,
        showNewCategoryInput,
        handleSubmitProduct,
        resetForm,
        isEditing,
        initialProduct
    };
};