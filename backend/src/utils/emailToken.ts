import { transporter } from '../config/email';
import bcrypt from 'bcrypt';

// Generar token de verificación
export const generateEmailToken = async (): Promise<string> => {
    const salt = await bcrypt.genSalt(12); //
    return salt.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
};


// Enviar email de verificación
export const sendVerificationEmail = async (email: string, name: string, token: string) => {
    const verificationUrl = `${process.env.URL_FRONTEND}/auth/verify-email?token=${token}`;

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
                    Este enlace expira en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este email.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};