import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { CheckCircleOutlined } from '@ant-design/icons';
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
        <>
            {!emailSent ? (
                <>
                    <h1 className="text-4xl text-white font-bold">Recuperar Contraseña</h1>
                    <p className="text-white text-center mt-2 mb-6">
                        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                    </p>

                    <form
                        onSubmit={handleSubmit(handleForgotPassword)}
                        className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
                        noValidate
                    >
                        <div className="grid grid-cols-1 space-y-3">
                            <label htmlFor="email" className="text-2xl text-slate-500">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email de Registro"
                                className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
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

                        <input
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-red-600 p-3 text-lg w-full uppercase text-white rounded-lg font-bold cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            value={isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        />
                    </form>

                    <div className="text-center mt-6 space-y-2">
                        <Link
                            to="/auth/login"
                            className="block text-blue-400 hover:underline"
                        >
                            Volver al login
                        </Link>
                        <Link
                            to="/auth/register"
                            className="block text-blue-400 hover:underline"
                        >
                            Crear cuenta nueva
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="text-center">
                        <CheckCircleOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                        <h1 className="text-4xl text-white font-bold mb-4"
                        >Email enviado</h1>
                        <div className="bg-white px-5 py-8 rounded-lg">
                            <p className="text-gray-600 mb-4">
                                Hemos enviado un enlace de recuperación a <strong>{getValues('email')}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Revisa tu bandeja de entrada y spam. El enlace expira en 1 hora.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-6 space-y-2">
                        <Link
                            to="/auth/login"
                            className="block text-blue-400 hover:underline"
                        >
                            Volver al login
                        </Link>
                        <Link
                            to="/auth/register"
                            className="block text-blue-400 hover:underline"
                        >
                            Crear cuenta nueva
                        </Link>
                    </div>
                </>
            )}
        </>
    );
};

export default ForgotPasswordView;