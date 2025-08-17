import { Router } from 'express';
import { body, param, query } from 'express-validator'
import { createAccount, getUser, login } from './handlers/auth';
import { handleInputErrors } from './middleware/validation';
import { createProduct, getProductById, getProducts, sellProduct, updateProduct, toggleProductStatus } from './handlers/product';
import { uploadProductImage } from './middleware/upload';
import { getCategories } from './handlers/category';
import { authenticate, requireAdmin } from './middleware/auth';
import { optionalAuth } from './middleware/optionalAuth';

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
    authenticate,
    requireAdmin,
    uploadProductImage,
    body('name')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .trim(),
    body('price')
        .isInt({ min: 0 })
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
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),
    handleInputErrors,
    createProduct);

/* OBTENER PRODUCTOS */
router.get('/products',
    optionalAuth,
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
    query('isActive')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('isActive debe ser: true o false'),
    handleInputErrors,
    getProducts);

/* OBTENER PRODUCTO POR ID */
router.get('/products/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero válido'),
    handleInputErrors,
    getProductById);

/* ACTUALIZAR PRODUCTO COMPLETO */
router.put('/products/:id',
    authenticate,
    requireAdmin,
    uploadProductImage,
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero válido'),

    // Validaciones condicionales
    body('name')
        .optional()
        .if(body('name').exists())
        .notEmpty()
        .withMessage('El nombre del producto no puede estar vacío')
        .trim(),

    body('price')
        .optional()
        .if(body('price').exists())
        .isInt({ min: 1 })
        .withMessage('El precio debe ser un número entero mayor a 0 (pesos chilenos)'),

    body('stock')
        .optional()
        .if(body('stock').exists())
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),

    body('sku')
        .optional()
        .if(body('sku').exists())
        .isLength({ min: 1, max: 50 })
        .withMessage('El SKU debe tener entre 1 y 50 caracteres')
        .trim(),

    body('categoryId')
        .optional()
        .if(body('categoryId').exists())
        .isInt({ min: 1 })
        .withMessage('categoryId debe ser un número entero válido'),

    body('categoryName')
        .optional()
        .if(body('categoryName').exists())
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre de la categoría debe tener entre 2 y 50 caracteres')
        .trim(),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),

    handleInputErrors,
    updateProduct);

/* VENDER PRODUCTO (DECREMENTAR STOCK) */
router.patch('/products/:id/sell',
    authenticate,
    requireAdmin,
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero válido'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),
    handleInputErrors,
    sellProduct);

// TOGGLE STATUS PRODUCTO
router.patch('/products/:id/toggle-status',
    authenticate,
    requireAdmin,
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero válido'),
    handleInputErrors,
    toggleProductStatus);

// OBTENER CATEGORÍAS
router.get('/categories', getCategories);

// OBTENER USUARIO
router.get('/user', authenticate, getUser);

export default router;