import type { CreateProductForm } from "../types";

export const prepareProductFormData = (formData: CreateProductForm): FormData => {
    const productData = new FormData();

    productData.append('name', formData.name);

    if (formData.price !== undefined) {
        // Remover puntos del precio antes de enviarlo (12.000 -> 12000)
        const cleanPrice = formData.price.toString().replace(/\./g, '');
        productData.append('price', cleanPrice);
    }

    if (formData.stock !== undefined) {
        productData.append('stock', formData.stock.toString());
    }


    addBrandToFormData(productData, formData);
    addCategoryToFormData(productData, formData);
    addImageToFormData(productData);
    
    return productData;
};

const addBrandToFormData = (productData: FormData, formData: CreateProductForm): void => {
    if (formData.brandId && formData.brandId !== "0" && Number(formData.brandId) > 0) {
        productData.append('brandId', String(Number(formData.brandId)));
    } else if (formData.brandName) {
        productData.append('brandName', formData.brandName);
    }
};

const addCategoryToFormData = (productData: FormData, formData: CreateProductForm): void => {
    if (formData.categoryId && formData.categoryId !== "0" && Number(formData.categoryId) > 0) {
        productData.append('categoryId', formData.categoryId.toString());

    } else if (formData.categoryName) {
        productData.append('categoryName', formData.categoryName);
    }
};

const addImageToFormData = (productData: FormData): void => {
    const fileInput = document.getElementById('image') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
        productData.append('image', file);

    } else {
        console.log('No se encontró archivo para subir');
    }
};

export const clearFileInput = (): void => {
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
};