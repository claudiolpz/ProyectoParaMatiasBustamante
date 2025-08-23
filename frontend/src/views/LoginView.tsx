import { useNavigate, useLocation, Link } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from 'sonner'
import { isAxiosError } from "axios";
import { useEffect, useState, useRef } from "react";
import api from "../config/axios";
import { useAuth } from "../context/AuthProvider";
import ErrorMessage from "../components/ErrorMessage";
import type { LoginForm } from "../types";

const LoginView = () => {
    const { handleIniciarSesion, handleEstaLogeado, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isInitializing, setIsInitializing] = useState(true);
    const [showResendOption, setShowResendOption] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [resendingEmail, setResendingEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const toastShown = useRef(false);



    // Verificar si ya está logueado al cargar el componente
    useEffect(() => {
        if (!loading) {
            if (handleEstaLogeado()) {
                navigate('/', { replace: true });
            } else {
                setTimeout(() => setIsInitializing(false), 100);
            }
        }
    }, [loading, handleEstaLogeado, navigate]);

    useEffect(() => {
        if (location.state?.message && !toastShown.current) {
            const { message, type } = location.state;

            if (type === 'success') {
                toast.success(message);
            } else {
                toast.info(message);
            }

            toastShown.current = true;

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const initialValues: LoginForm = {
        email: "",
        password: ""
    };

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues
    });

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleResendVerification = async () => {
        if (!unverifiedEmail) return;

        setResendingEmail(true);
        try {
            const { data } = await api.post('/auth/resend-verification', {
                email: unverifiedEmail
            });
            toast.success(data.message);
            setShowResendOption(false);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error al reenviar email');
            }
        } finally {
            setResendingEmail(false);
        }
    };

    const handleLogin = async (formData: LoginForm) => {
        try {
            const { data } = await api.post(`/auth/login`, formData);

            // Usar el AuthProvider para iniciar sesión
            await handleIniciarSesion(data.token, data.user); // Si la API devuelve user data

            toast.success("Sesión iniciada exitosamente");

            // Redirigir después del login exitoso
            navigate('/', { replace: true });

        } catch (error) {
            if (isAxiosError(error) && error.response) {
                const errorData = error.response.data;

                // Email no verificado
                if (errorData.requiresVerification) {
                    setUnverifiedEmail(formData.email);
                    setShowResendOption(true);
                    toast.error(errorData.error);
                } else if (errorData.error) {
                    toast.error(errorData.error);
                }
                if (errorData.errors) {
                    errorData.errors.forEach((err: any) => {
                        if (err.msg) {
                            toast.error(err.msg);
                        }
                    });
                }
            } else {
                toast.error("Error al iniciar sesión");
            }
        }
    }

    // Mostrar loading mientras se verifica la autenticación
    if (loading || isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    {/* Loading más sutil - solo un pequeño spinner */}
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white text-sm opacity-75">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-4xl text-white font-bold">Iniciar Sesión</h1>

            {showResendOption && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 mb-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Email no verificado
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                Debes verificar tu email antes de iniciar sesión.
                            </p>
                            <div className="mt-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendingEmail}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {resendingEmail ? 'Enviando...' : 'Reenviar email de verificación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit(handleLogin)}
                className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
                noValidate
            >
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="email" className="text-2xl text-slate-500">
                        E-mail
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Email de Registro"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("email", {
                            required: "El Email es obligatorio",
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "E-mail no válido",
                            },
                        })}
                    />
                    {errors.email && (
                        <ErrorMessage>{errors.email.message}</ErrorMessage>
                    )}
                </div>

                              <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="password" className="text-2xl text-slate-500">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="bg-slate-100 border-none p-3 pr-12 rounded-lg placeholder-slate-400 w-full"
                            {...register("password", {
                                required: "La Contraseña es obligatoria",
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
                    {errors.password && (
                        <ErrorMessage>{errors.password.message}</ErrorMessage>
                    )}
                </div>
                <input
                    type="submit"
                    className="bg-blue-600 p-3 text-lg w-full  text-white rounded-lg font-bold cursor-pointer"
                    value="Iniciar Sesión"
                />
            </form>
            <div className="text-center mt-4 space-y-2">
                <Link
                    to="/auth/forgot-password"
                    className="block text-blue-400 hover:underline text-sm hover:text-white"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>
        </>
    );
};

export default LoginView;