import prisma from "../config/prisma";
import { validatePartialProductData } from "../validators";
import { cleanupCloudinaryFile, getPublicIdFromUrl } from "../middleware/upload";
import type { UpdateProductResult, UpdateProductRequest, ValidationSuccessResult, ValidationErrorResult } from "../types/index"
import { processProductBrand, processProductCategory } from "../helpers/productHelpers";

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
            const categoryResult = await processProductCategory(request.categoryId, request.categoryName);
            if (!categoryResult.success) {
                await this.cleanupImageIfProvided(request.imageFile);
                return categoryResult;
            }
            // 4. Procesar marca (solo si se proporciona)
            const brandResult = await processProductBrand(request.brandId, request.brandName);
            if (!brandResult.success) {
                await this.cleanupImageIfProvided(request.imageFile);
                return brandResult;
            }
            // 5. Construir datos de actualización (solo campos proporcionados)
            const updateData = await this.buildPartialUpdateData(request, validation.validatedData, categoryResult, brandResult);

            // 6. Manejar imagen
            await this.handleImageUpdate(request, existingProduct.product, updateData);

            // 7. Verificar que hay algo para actualizar
            if (Object.keys(updateData).length === 0) {
                return {
                    success: false,
                    error: "No hay campos para actualizar",
                    statusCode: 400
                };
            }

            // 8. Ejecutar actualización
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
    // construir datos parciales
    private async buildPartialUpdateData(
        request: UpdateProductRequest,
        validatedData: { priceNum?: number; stockNum?: number },
        categoryResult?: any,
        brandResult?: any
    ): Promise<any> {

        const { name } = request;
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
        if (categoryResult?.success) {
            // Categoría existente
            updateData.categoryId = categoryResult.categoryData.id;
        }

        if (brandResult?.brandData !== null && brandResult?.success) {
            // Marca existente
            updateData.brandId = brandResult.brandData.id;
        } else {
            updateData.brandId = null;
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