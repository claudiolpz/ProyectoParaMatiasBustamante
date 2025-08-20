import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import api from '../config/axios';
import ErrorMessage from '../components/ErrorMessage';
import { passwordRegex } from '../validators/accontValidator';
import type { ResetPasswordForm } from '../types';

const ResetPasswordView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toastShown = useRef(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
    const password = watch("password");

    // CONTROLAR TOASTS CON useEffect
    useEffect(() => {
        if (!toastShown.current) {
            if (status === 'invalid') {
                toast.error("Token inválido o expirado");
                toastShown.current = true;
            }
        }
    }, [status]);

    // Verificar token al cargar
    useEffect(() => {
        const token = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (!token) {
            setStatus('invalid');
            return;
        }

        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }

        const verifyToken = async () => {
            try {
                const { data } = await api.post('/auth/verify-reset-token', { token });
                setStatus('valid');
                if (data.email && !email) {
                    setEmail(data.email);
                }
            } catch (error) {
                setStatus('invalid');
            }
        };

        verifyToken();
    }, [searchParams, email]);

    const handleResetPassword = async (formData: ResetPasswordForm) => {
        const token = searchParams.get('token');

        if (!token) {
            toast.error('Token no válido');
            return;
        }

        //Resetear el flag antes de cada intento
        toastShown.current = false;
        setIsSubmitting(true);

        try {
            const { data } = await api.post('/auth/reset-password', {
                token,
                password: formData.password
            });

            setStatus('success');

            // ✅ NO TOAST AQUÍ - solo en caso de error o navegación con state
            setTimeout(() => {
                navigate('/auth/login', {
                    state: {
                        message: data.message || 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.',
                        type: 'success'
                    }
                });
            }, 2000);

        } catch (error) {
            if (!toastShown.current) {
                if (isAxiosError(error) && error.response) {
                    if (error.response.data.error) {
                        toast.error(error.response.data.error);
                        toastShown.current = true;
                    } else if (error.response.data.errors) {
                        // Solo mostrar el primer error
                        toast.error(error.response.data.errors[0]?.msg || "Error en los datos");
                        toastShown.current = true;
                    }
                } else {
                    toast.error('Error al restablecer contraseña');
                    toastShown.current = true;
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold mb-2">Verificando enlace...</h2>
                        <p className="text-gray-600">Por favor espera mientras verificamos tu solicitud.</p>
                    </>
                )}

                {status === 'valid' && (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Restablecer Contraseña</h2>
                        {email && (
                            <p className="text-gray-600 mb-6">Para: <strong>{email}</strong></p>
                        )}

                        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4 text-left">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    {...register("password", {
                                        required: "La Contraseña es obligatoria",
                                        minLength: {
                                            value: 8,
                                            message: "La Contraseña debe tener al menos 8 caracteres",
                                        },
                                        pattern: {
                                            value: passwordRegex,
                                            message: "Debe incluir mayúscula, minúscula, número y carácter especial"
                                        }
                                    })}
                                />
                                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    {...register("password_confirmation", {
                                        required: "La Confirmación es obligatoria",
                                        validate: (value) => value === password || 'Las Contraseñas no son iguales'
                                    })}
                                />
                                {errors.password_confirmation && (
                                    <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            </button>
                        </form>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold text-green-600 mb-2">¡Contraseña restablecida!</h2>
                        <p className="text-gray-600 mb-4">Tu contraseña ha sido actualizada exitosamente.</p>
                        <p className="text-sm text-gray-500">Serás redirigido al login en unos segundos...</p>
                    </>
                )}

                {status === 'invalid' && (
                    <>
                        <div className="text-red-600 text-5xl mb-4">✗</div>
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Enlace inválido</h2>
                        <p className="text-gray-600 mb-4">
                            El enlace de recuperación es inválido o ha expirado.
                        </p>
                        <div className="space-y-2">
                            <Link
                                to="/auth/forgot-password"
                                className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Solicitar nuevo enlace
                            </Link>
                            <Link
                                to="/auth/login"
                                className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                            >
                                Volver al Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordView;