import type { CreateProductForm } from "../types";

export const prepareProductFormData = (formData: CreateProductForm): FormData => {
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

    addCategoryToFormData(productData, formData);
    addImageToFormData(productData);

    return productData;
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

    console.log('Archivo del input:', file);

    if (file) {
        productData.append('image', file);
        console.log('Archivo agregado al FormData:', file.name);
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