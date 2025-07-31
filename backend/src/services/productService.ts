import prisma from "../config/prisma";
import fs from 'fs';
import path from 'path';

// Función para validar los datos del producto
export const validateProductData = (name: string, price: string, stock: string, categoryId?: string, categoryName?: string) => {
    if (!name || price == null || stock == null || (!categoryId && !categoryName)) {
        return { isValid: false, error: "Faltan campos obligatorios" };
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (isNaN(priceNum) || priceNum <= 0) {
        return { isValid: false, error: "El precio debe ser un número mayor a 0" };
    }

    if (isNaN(stockNum) || stockNum < 0) {
        return { isValid: false, error: "El stock debe ser un número mayor o igual a 0" };
    }

    return { isValid: true, priceNum, stockNum };
};

// Función para validar SKU único
export const validateSKU = async (sku: string) => {
    const skuExists = await prisma.product.findUnique({
        where: { sku: sku.trim() }
    });

    if (skuExists) {
        return { isValid: false, error: "El SKU ya está asociado a otro producto" };
    }

    return { isValid: true };
};

// Función para manejar categoría por ID
export const handleCategoryById = async (categoryId: string) => {
    const categoryIdNum = Number(categoryId);
    
    if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
        return { isValid: false, error: "categoryId debe ser un número válido mayor a 0" };
    }

    const existingCategory = await prisma.category.findUnique({
        where: { id: categoryIdNum }
    });

    if (!existingCategory) {
        return { isValid: false, error: "La categoría especificada no existe" };
    }

    return { 
        isValid: true, 
        categoryData: { connect: { id: existingCategory.id } }
    };
};

// Función para manejar categoría por nombre
export const handleCategoryByName = async (categoryName: string) => {
    const trimmedCategoryName = categoryName.trim();

    if (!trimmedCategoryName || trimmedCategoryName.length < 2) {
        return { 
            isValid: false, 
            error: "Nombre de categoría inválido. Debe tener al menos 2 caracteres" 
        };
    }

    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: trimmedCategoryName,
                mode: "insensitive"
            }
        }
    });

    const categoryData = existingCategory
        ? { connect: { id: existingCategory.id } }
        : { create: { name: trimmedCategoryName } };

    return { isValid: true, categoryData };
};

// Función para limpiar archivo en caso de error
export const cleanupFile = (filename: string) => {
    try {
        fs.unlinkSync(path.join('public/uploads/products', filename));
        console.log("Archivo eliminado por error:", filename);
    } catch (unlinkError) {
        console.error("Error al eliminar archivo:", unlinkError);
    }
};