import nodemailer from 'nodemailer';

// Configuración del transportador
export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER, // tu email
        pass: process.env.EMAIL_PASS, // tu contraseña de aplicación
    },
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.error('Error de configuración de email:', error);
    } else {
        console.log('Servidor de email listo');
    }
});