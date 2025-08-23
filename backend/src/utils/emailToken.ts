import { transporter } from '../config/email';
import bcrypt from 'bcrypt';

//  token de verificación
export const generateToken = async (): Promise<string> => {
    const salt = await bcrypt.genSalt(12); 
    return salt.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
};

// Enviar email de verificación
export const sendVerificationEmail = async (email: string, name: string, token: string) => {

    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verificar tu cuenta - ProyectoParaMatiasBustamante',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">¡Bienvenido ${name}!</h2>
                <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                <a href="${verificationUrl}" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Verificar mi cuenta
                </a>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
                    ${verificationUrl}
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                    <strong>Este enlace expira en 24 horas.</strong> Si no solicitaste esta cuenta, puedes ignorar este email.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                    Si el enlace expiró, puedes solicitar uno nuevo desde la página de inicio de sesión.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperar contraseña - ProyectoParaMatiasBustamante',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Recuperar contraseña</h2>
                <p>Hola ${name},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el siguiente enlace:</p>
                <a href="${resetUrl}" 
                   style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Restablecer contraseña
                </a>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
                    ${resetUrl}
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                    <strong>Este enlace expira en 1 hora.</strong> Si no solicitaste este cambio, puedes ignorar este email de forma segura.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                    Por seguridad, nunca compartas este enlace con nadie.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};