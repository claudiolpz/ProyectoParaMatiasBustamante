import { Router } from 'express';
import { body } from 'express-validator'
import { createAccount } from './handlers';

const router = Router();

/** AUTENTICACION */
router.post('/auth/register', 
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
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
    createAccount);

export default router;