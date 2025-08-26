import { body } from 'express-validator';

export const createBrandValidation = [
    body('name')
        .notEmpty()
        .withMessage('El nombre de la marca es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre de la marca debe tener entre 2 y 50 caracteres')
        .trim()
];

export const updateBrandValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre de la marca debe tener entre 2 y 50 caracteres')
        .trim()
];
