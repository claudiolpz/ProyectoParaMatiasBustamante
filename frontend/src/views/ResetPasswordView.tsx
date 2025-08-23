import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false); // Estado para mostrar/ocultar confirmación
    const toastShown = useRef(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>();
    const password = watch("password");

    // Funciones para alternar la visibilidad de las contraseñas
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const togglePasswordConfirmationVisibility = () => {
        setShowPasswordConfirmation(prev => !prev);
    };

    useEffect(() => {
        if (!toastShown.current) {
            if (status === 'invalid') {
                toast.error("Token inválido o expirado");
                toastShown.current = true;
            }
        }
    }, [status]);

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
                if(error){
                    setStatus('invalid');
                }
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

        toastShown.current = false;
        setIsSubmitting(true);

        try {
            const { data } = await api.post('/auth/reset-password', {
                token,
                password: formData.password
            });

            setStatus('success');

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
        <>
            {status === 'loading' && (

                <div className="text-center">
                    <LoadingOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">Verificando enlace...</h1>
                    <div className="bg-white px-5 py-8 rounded-lg">
                        <p className="text-gray-600">Por favor espera mientras verificamos tu solicitud.</p>
                    </div>
                </div>

            )}

            {status === 'valid' && (
                <>
                    <h1 className="text-4xl text-white font-bold">Restablecer Contraseña</h1>
                    <form
                        onSubmit={handleSubmit(handleResetPassword)}
                        className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
                        noValidate
                    >
                        <div className="grid grid-cols-1 space-y-3">
                            <label className="text-2xl text-slate-500">
                                E-Mail: {email}
                            </label>
                            <label htmlFor="password" className="text-2xl text-slate-500 mt-3">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nueva contraseña"
                                    className="bg-slate-100 border-none p-3 pr-12 rounded-lg placeholder-slate-400 w-full"
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
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 focus:outline-none"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? (
                                        // Icono de ojo cerrado (ocultar)
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        // Icono de ojo abierto (mostrar)
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                        </div>

                        <div className="grid grid-cols-1 space-y-3">
                            <label htmlFor="password_confirmation" className="text-2xl text-slate-500">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    placeholder="Confirmar contraseña"
                                    className="bg-slate-100 border-none p-3 pr-12 rounded-lg placeholder-slate-400 w-full"
                                    {...register("password_confirmation", {
                                        required: "La Confirmación es obligatoria",
                                        validate: (value) => value === password || 'Las Contraseñas no son iguales'
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordConfirmationVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 focus:outline-none"
                                    aria-label={showPasswordConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPasswordConfirmation ? (
                                        // Icono de ojo cerrado (ocultar)
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        // Icono de ojo abierto (mostrar)
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
                            )}
                        </div>

                        <input
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-red-600 p-3 text-lg w-full  text-white rounded-lg font-bold cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            value={isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        />
                    </form>
                </>
            )}

            {status === 'success' && (

                <div className="text-center">
                    <CheckCircleOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">¡Contraseña restablecida!</h1>
                    <div className="bg-white px-5 py-8 rounded-lg">
                        <p className="text-gray-600 mb-4">Tu contraseña ha sido actualizada exitosamente.</p>
                        <p className="text-sm text-gray-500">Serás redirigido al login en unos segundos...</p>
                    </div>
                </div>

            )}

            {status === 'invalid' && (

                <div className="text-center">
                    <CloseCircleOutlined className="text-6xl mb-4"
                        style={{ color: 'white', fontSize: '4rem'}} />
                    <h1 className="text-4xl text-white font-bold mb-4">Enlace inválido</h1>
                    <div className="bg-white px-5 py-8 rounded-lg space-y-4">
                        <p className="text-gray-600 mb-4">
                            El enlace de recuperación es inválido o ha expirado.
                        </p>
                        <div className="space-y-2">
                            <Link
                                to="/auth/forgot-password"
                                className="block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-center"
                            >
                                Solicitar nuevo enlace
                            </Link>
                            <Link
                                to="/auth/login"
                                className="block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-center"
                            >
                                Volver al Login
                            </Link>
                        </div>
                    </div>
                </div>

            )}
        </>
    );
};

export default ResetPasswordView;