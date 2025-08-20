import prisma from "../config/prisma";
import { validatePartialProductData } from "../validators";
import { cleanupFile } from "../utils/fileUtils";
import { handleCategoryById, handleCategoryByName, validateSKU } from "./productService";
import type { UpdateProductResult, UpdateProductRequest, ValidationSuccessResult, ValidationErrorResult, CategorySuccessResult, CategoryErrorResult } from "../types/index"

const SERVER_URL = process.env.URL_BACKEND || process.env.URL_BACKEND_LOCAL;

export class ProductUpdateService {

    async updateProduct(request: UpdateProductRequest): Promise<UpdateProductResult> {
        try {
            // 1. Verificar que el producto existe
            const existingProduct = await this.findExistingProduct(request.id);
            if (!existingProduct.success) {
                this.cleanupImageIfProvided(request.imageFile);
                return existingProduct;
            }

            // 2. Validar datos de entrada usando validatePartialProductData
            const validation = await this.validateUpdateRequest(request, existingProduct.product);
            if (!validation.success) {
                this.cleanupImageIfProvided(request.imageFile);
                return validation;
            }

            // 3. Procesar categoría (solo si se proporciona)
            const categoryResult = await this.processCategoryUpdate(request);
            if (!categoryResult.success) {
                this.cleanupImageIfProvided(request.imageFile);
                return categoryResult;
            }

            // 4. Construir datos de actualización (solo campos proporcionados)
            const updateData = this.buildPartialUpdateData(request, validation.validatedData, categoryResult.categoryData);

            // 5. Manejar imagen
            this.handleImageUpdate(request, existingProduct.product, updateData);

            // 6. Verificar que hay algo para actualizar
            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: "No hay campos para actualizar",
                    statusCode: 400
                };
            }

            // 7. Ejecutar actualización
            const updatedProduct = await this.executeUpdate(request.id, updateData);

            return {
                success: true,
                product: updatedProduct
            };

        } catch (error) {
            console.error("Error en ProductUpdateService:", error);
            this.cleanupImageIfProvided(request.imageFile);
            return {
                success: false,
                error: "Error interno al actualizar producto",
                statusCode: 500
            };
        }
    }

    private async findExistingProduct(productId: number): Promise<UpdateProductResult> {
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return {
                success: false,
                error: "Producto no encontrado",
                statusCode: 404
            };
        }

        return {
            success: true,
            product: existingProduct
        };
    }

    private async validateUpdateRequest(
        request: UpdateProductRequest,
        existingProduct: any
    ): Promise<ValidationSuccessResult | ValidationErrorResult> {
        const { name, price, stock, categoryId, categoryName, sku } = request;

        // CORREGIDO: Usar validatePartialProductData
        const validation = validatePartialProductData({
            name,
            price,
            stock,
            categoryId,
            categoryName
        });

        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error,
                statusCode: 400
            };
        }

        // Validar SKU único si se cambió
        if (sku !== undefined && sku !== existingProduct.sku) {
            const skuValidation = await validateSKU(sku, request.id);
            if (!skuValidation.isValid) {
                return {
                    success: false,
                    error: skuValidation.error,
                    statusCode: 409
                };
            }
        }

        return {
            success: true,
            validatedData: {
                priceNum: validation.priceNum,
                stockNum: validation.stockNum
            }
        };
    }

    private async processCategoryUpdate(
        request: UpdateProductRequest
    ): Promise<CategorySuccessResult | CategoryErrorResult> {
        const { categoryId, categoryName } = request;

        // Si no se proporciona categoría, no hacer nada
        if (categoryId === undefined && categoryName === undefined) {
            return {
                success: true,
                categoryData: undefined
            };
        }

        let categoryResult;
        if (categoryId !== undefined && categoryId !== null) {
            categoryResult = await handleCategoryById(categoryId);
        } else if (categoryName) {
            categoryResult = await handleCategoryByName(categoryName);
        } else {
            return {
                success: false,
                error: "Si proporciona categoría, debe ser categoryId o categoryName válido",
                statusCode: 400
            };
        }

        if (!categoryResult.isValid) {
            return {
                success: false,
                error: categoryResult.error,
                statusCode: categoryId !== undefined ? 404 : 400
            };
        }

        return {
            success: true,
            categoryData: categoryResult.categoryData
        };
    }

    // construir datos parciales
    private buildPartialUpdateData(
        request: UpdateProductRequest,
        validatedData: { priceNum?: number; stockNum?: number },
        categoryData?: any
    ): any {
        const { name, sku } = request;
        const { priceNum, stockNum } = validatedData;
        
        const updateData: any = {};

        // Solo agregar campos que se proporcionaron
        if (name !== undefined) {
            updateData.name = name.trim();
        }

        if (priceNum !== undefined) {
            updateData.price = priceNum;
        }

        if (stockNum !== undefined) {
            updateData.stock = stockNum;
        }

        if (sku !== undefined) {
            updateData.sku = sku?.trim() || null;
        }

        if (categoryData !== undefined) {
            updateData.category = categoryData;
        }

        return updateData;
    }

    private handleImageUpdate(
        request: UpdateProductRequest,
        existingProduct: any,
        updateData: any
    ): void {
        const { imageFile } = request;

        if (imageFile?.filename) {
            // Eliminar imagen anterior si existe
            if (existingProduct.image) {
                cleanupFile(existingProduct.image);
            }
            updateData.image = imageFile.filename;
        }
    }

    private async executeUpdate(productId: number, updateData: any): Promise<any> {
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: updateData,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            ...updatedProduct,
            image: updatedProduct.image ? `${SERVER_URL}/uploads/products/${updatedProduct.image}` : null
        };
    }

    private cleanupImageIfProvided(imageFile?: Express.Multer.File): void {
        if (imageFile?.filename) {
            cleanupFile(imageFile.filename);
        }
    }
}