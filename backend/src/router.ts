import { Router } from 'express';
import { body, query } from 'express-validator'
import { createAccount, login } from './handlers/auth';
import { handleInputErrors } from './middleware/validation';
import { createProduct, getProducts } from './handlers/product';
import { uploadProductImage } from './middleware/upload';
import { getCategories } from './handlers/category';

const router = Router();

/* REGISTRO */
router.post('/auth/register', 
    body('email')
        .notEmpty()
        .withMessage('El Email es obligatorio')
        .isEmail()
        .withMessage('Formato de Email incorrecto'),
    body('password')
        .notEmpty()
        .withMessage('La Contraseña es obligatoria')
        .isLength({ min: 6 })
        .withMessage('La Contraseña debe tener al menos 6 caracteres'),
    body('name')
        .notEmpty()
        .withMessage('El Nombre es obligatorio'),
    body('lastname')     
        .notEmpty()
        .withMessage('El Apellido es obligatorio'),
    handleInputErrors,
    createAccount);

/* AUTENTICAR */
router.post('/auth/login',
    body('email')
        .notEmpty()
        .withMessage('El Email es obligatorio')
        .isEmail()
        .withMessage('Formato de Email incorrecto'),
    body('password')
        .notEmpty()
        .withMessage('La Contraseña es obligatoria'),
    handleInputErrors,
    login);

/* CREAR PRODUCTO */
router.post('/products',
    uploadProductImage, // ← Primero el middleware de upload
    body('name')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .trim(),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('El precio debe ser un número mayor a 0'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('sku')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('El SKU debe tener entre 1 y 50 caracteres')
        .trim(),
    body('categoryId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('categoryId debe ser un número entero válido'),
    body('categoryName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre de la categoría debe tener entre 2 y 50 caracteres')
        .trim(),
    handleInputErrors,
    createProduct);
    
/* OBTENER PRODUCTOS */
router.get('/products',
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    query('orderBy')
        .optional()
        .isIn(['name', 'price', 'stock', 'category'])
        .withMessage('orderBy debe ser: name, price o stock'),
    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('order debe ser: asc o desc'),
    query('categoryId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('categoryId debe ser un número entero válido'),
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('La búsqueda debe tener entre 1 y 100 caracteres')
        .trim(),
    handleInputErrors,
    getProducts);

    // OBTENER CATEGORÍAS
    router.get('/categories', getCategories);

export default router;