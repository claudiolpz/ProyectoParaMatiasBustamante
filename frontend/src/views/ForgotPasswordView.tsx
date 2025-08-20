import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import ErrorMessage from '../components/ErrorMessage';
import { expresion_correo } from '../validators/accontValidator';
import type { ForgotPasswordForm } from '../types';


const ForgotPasswordView = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordForm>();

    const handleForgotPassword = async (formData: ForgotPasswordForm) => {
        setIsSubmitting(true);

        try {
            const { data } = await api.post('/auth/request-password-reset', formData);
            toast.success(data.message);
            setEmailSent(true);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                if (error.response.data.error) {
                    toast.error(error.response.data.error);
                } else if (error.response.data.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        toast.error(err.msg);
                    });
                }
            } else {
                toast.error('Error al procesar solicitud');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-800">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                {!emailSent ? (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-2">Recuperar Contraseña</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                        </p>

                        <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="tu-email@ejemplo.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    {...register("email", {
                                        required: "El Email es obligatorio",
                                        pattern: {
                                            value: expresion_correo,
                                            message: "E-mail no válido",
                                        },
                                    })}
                                />
                                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="text-green-600 text-5xl mb-4">📧</div>
                        <h2 className="text-xl font-semibold text-green-600 mb-2">Email enviado</h2>
                        <p className="text-gray-600 mb-4">
                            Hemos enviado un enlace de recuperación a <strong>{getValues('email')}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora.
                        </p>
                    </div>
                )}

                <div className="text-center mt-6 space-y-2">
                    <Link
                        to="/auth/login"
                        className="block text-blue-600 hover:underline"
                    >
                        Volver al login
                    </Link>
                    <Link
                        to="/auth/register"
                        className="block text-gray-600 hover:underline"
                    >
                        Crear cuenta nueva
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;