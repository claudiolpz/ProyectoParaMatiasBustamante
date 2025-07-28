import { Router } from 'express';
import { body } from 'express-validator'
import { createAccount, login } from './handlers';
import { handleInputErrors } from './middleware/validation';

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
    login)
export default router;