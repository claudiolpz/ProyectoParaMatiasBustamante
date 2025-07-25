import { Router } from 'express';
import { body } from 'express-validator'
import { createAccount, login } from './handlers';
import { handleInputErrors } from './middleware/validation';

const router = Router();

/* REGISTRO */
router.post('/auth/register', 
    body('email')
        .notEmpty()
        .withMessage('El E-mail es obligatorio')
        .isEmail()
        .withMessage('Formato de E-mail incorrecto'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name')
        .notEmpty()
        .withMessage('El nombre es obligatorio'),
    body('lastname')     
        .notEmpty()
        .withMessage('El apellido es obligatorio'),
    handleInputErrors,
    createAccount);

/* AUTENTICAR */
router.post('/auth/login',
    body('email')
        .notEmpty()
        .withMessage('El E-mail es obligatorio')
        .isEmail()
        .withMessage('Formato de E-mail incorrecto'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    login)
export default router;