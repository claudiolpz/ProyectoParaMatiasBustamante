import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de multer para usar memoria (no guardar en disco)
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpeg, png, jpg, webp)'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

// Función para subir imagen a Cloudinary
const uploadToCloudinary = (buffer: Buffer, originalname: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'products',
                public_id: `product-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ],
                allowed_formats: ['jpeg', 'png', 'jpg', 'webp']
            },
            (error, result) => {
                if (error) {
                    reject(new Error(error.message || 'Cloudinary upload failed'));
                } else {
                    resolve(result);
                }
            }
        );

        // Convertir buffer a stream y hacer pipe al upload
        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
    });
};

export const uploadProductImage = (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, async (err: any) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'El archivo es demasiado grande. Máximo permitido: 5MB'
                });
            }
            if (err.message.includes('Solo se permiten archivos')) {
                return res.status(400).json({
                    error: err.message
                });
            }
            return res.status(400).json({
                error: 'Error al subir archivo'
            });
        }

        // Si no hay archivo, continuar sin error
        if (!req.file) {
            return next();
        }

        try {
            // Subir a Cloudinary usando el SDK oficial.       
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            // Agregar información de Cloudinary al objeto file usando casting
            (req.file as any).path = result.secure_url; // URL de la imagen
            (req.file as any).public_id = result.public_id; // public_id para futuras operaciones
            (req.file as any).cloudinary = result; // Toda la respuesta de Cloudinary

            next();
        } catch (uploadError) {
            console.error('Error subiendo a Cloudinary:', uploadError);
            return res.status(500).json({
                error: 'Error al procesar la imagen'
            });
        }
    });
};

// Función para eliminar imagen de Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error eliminando imagen de Cloudinary:', error);
        throw error;
    }
};

// Función para extraer el public_id de una URL de Cloudinary
export const getPublicIdFromUrl = (url: string): string => {
    try {
        // Ejemplo URL: https://res.cloudinary.com/cloud/image/upload/v123456/products/product-123.jpg
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');

        if (uploadIndex === -1) return '';
        // Obtener después de la versión
        const pathAfterVersion = parts.slice(uploadIndex + 2).join('/');
        // Remover la extensión
        const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');

        return publicId;
    } catch (error) {
        console.error('Error extrayendo public_id:', error);
        return '';
    }
};

// Función para cleanup en caso de error
export const cleanupCloudinaryFile = async (publicId: string): Promise<void> => {
    try {
        if (publicId) {
            await deleteFromCloudinary(publicId);
            console.log(`Imagen ${publicId} eliminada de Cloudinary`);
        }
    } catch (error) {
        console.error('Error limpiando archivo de Cloudinary:', error);
    }
};

// Función para transformar imágenes existentes (opcional)
export const transformImage = (publicId: string, transformations: any[]): string => {
    return cloudinary.url(publicId, {
        transformation: transformations
    });
};

// Función para generar URLs optimizadas
export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number): string => {
    return cloudinary.url(publicId, {
        transformation: [
            { width: width || 400, height: height || 300, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
        ]
    });
};