import prisma from "../config/prisma";
import { validateSkuUniqueness } from "../validators";

// Función para manejar categoría por ID
export const handleCategoryById = async (categoryId: number) => {
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

// Re-exportar validador de SKU para compatibilidad
export const validateSKU = validateSkuUniqueness;