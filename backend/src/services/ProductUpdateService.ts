import prisma from "../config/prisma";
import { validatePartialProductData } from "../validators";
import { cleanupCloudinaryFile, getPublicIdFromUrl } from "../middleware/upload";
import { handleCategoryById, handleCategoryByName } from "./productService";
import type { UpdateProductResult, UpdateProductRequest, ValidationSuccessResult, ValidationErrorResult, CategorySuccessResult, CategoryErrorResult } from "../types/index"

// Helper para manejar tipos de Cloudinary
const getCloudinaryFile = (file: Express.Multer.File | undefined) => file as any;

export class ProductUpdateService {

    async updateProduct(request: UpdateProductRequest): Promise<UpdateProductResult> {
        try {
            // 1. Verificar que el producto existe
            const existingProduct = await this.findExistingProduct(request.id);
            if (!existingProduct.success) {
                await this.cleanupImageIfProvided(request.imageFile);
                return existingProduct;
            }

            // 2. Validar datos de entrada usando validatePartialProductData
            const validation = await this.validateUpdateRequest(request, existingProduct.product);
            if (!validation.success) {
                await this.cleanupImageIfProvided(request.imageFile);
                return validation;
            }

            // 3. Procesar categoría (solo si se proporciona)
            const categoryResult = await this.processCategoryUpdate(request);
            if (!categoryResult.success) {
                await this.cleanupImageIfProvided(request.imageFile);
                return categoryResult;
            }
            // 4. Construir datos de actualización (solo campos proporcionados)
            const updateData = await this.buildPartialUpdateData(request, validation.validatedData, categoryResult.categoryData);

            // 5. Manejar imagen
            await this.handleImageUpdate(request, existingProduct.product, updateData);

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
            await this.cleanupImageIfProvided(request.imageFile);
            return {
                success: false,
                error: "Error interno al actualizar producto",
                statusCode: 500
            };
        }
    }

    private async findExistingProduct(productId: number): Promise<UpdateProductResult> {
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                brand: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
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
        const { name, price, stock, categoryId, categoryName } = request;

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

        // No validar unicidad de marca ya que puede repetirse

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
    private async buildPartialUpdateData(
        request: UpdateProductRequest,
        validatedData: { priceNum?: number; stockNum?: number },
        categoryData?: any
    ): Promise<any> {

        const { name, brandId } = request;
        const { priceNum, stockNum } = validatedData;

        const updateData: any = {};

        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (priceNum !== undefined) {
            updateData.price = priceNum;
        }
        if (stockNum !== undefined) {
            updateData.stock = stockNum;
        }
        if (brandId !== undefined) {
            updateData.brandId = Number(brandId) || null;
        }

        if (categoryData?.connect?.id) {
            // Categoría existente
            updateData.categoryId = categoryData.connect.id;
        } else if (categoryData?.create?.name) {
            // Crear nueva categoría primero
            const newCategory = await prisma.category.create({
                data: { name: categoryData.create.name }
            });
            updateData.categoryId = newCategory.id;
        }

        return updateData;
    }
    private async handleImageUpdate(
        request: UpdateProductRequest,
        existingProduct: any,
        updateData: any
    ): Promise<void> {
        const { imageFile } = request;

        if (imageFile?.path) {
            // Si hay imagen anterior, eliminarla de Cloudinary
            if (existingProduct.image) {
                const oldPublicId = getPublicIdFromUrl(existingProduct.image);
                if (oldPublicId) {
                    await cleanupCloudinaryFile(oldPublicId);
                }
            }

            // Agregar nueva imagen (URL completa de Cloudinary)
            updateData.image = imageFile.path;
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
                },
                brand: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Con Cloudinary, la imagen ya es una URL completa, no necesitas construirla
        return {
            ...updatedProduct,
            image: updatedProduct.image // Ya es URL completa de Cloudinary
        };
    }

    private async cleanupImageIfProvided(imageFile?: Express.Multer.File): Promise<void> {
        const cloudinaryFile = getCloudinaryFile(imageFile);
        if (cloudinaryFile?.public_id) {
            await cleanupCloudinaryFile(cloudinaryFile.public_id);
        }
    }
}