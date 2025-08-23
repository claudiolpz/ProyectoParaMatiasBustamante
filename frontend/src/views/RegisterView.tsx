import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { toast } from 'sonner';
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthProvider";
import type { RegisterForm } from "../types";
import ErrorMessage from "../components/ErrorMessage";
import api from "../config/axios";
import { passwordRegex, expresion_correo } from "../validators/accontValidator";

const RegisterView = () => {
    const { handleEstaLogeado, loading } = useAuth();
    const navigate = useNavigate();
    const [isInitializing, setIsInitializing] = useState(true);
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false); // Estado para mostrar/ocultar confirmación
    const toastShown = useRef(false);

    // Verificar si ya está logueado al cargar el componente
    useEffect(() => {
        if (!loading) {
            if (handleEstaLogeado()) {
                navigate('/', { replace: true }); // Redirigir al home
            } else {
                // Pequeño delay para evitar flash
                setTimeout(() => setIsInitializing(false), 100);
            }
        }
    }, [loading, handleEstaLogeado, navigate]);

    const initialValues: RegisterForm = {
        name: "",
        lastname: "",
        email: "",
        password: "",
        password_confirmation: ""
    };

    const { register, watch, reset, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues
    });

    const password = watch("password");

    // Funciones para alternar la visibilidad de las contraseñas
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const togglePasswordConfirmationVisibility = () => {
        setShowPasswordConfirmation(prev => !prev);
    };

    const handelRegister = async (formData: RegisterForm) => {
        toastShown.current = false;

        try {
            const { data } = await api.post(`/auth/register`, formData);

            reset();

            navigate('/auth/login', {
                replace: true,
                state: {
                    message: data.message || 'Cuenta creada. Revisa tu email para verificar tu cuenta antes de iniciar sesión.',
                    email: formData.email,
                    type: 'success' // Especificar tipo
                }
            });

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
                    toast.error("Error al crear la cuenta");
                    toastShown.current = true;
                }
            }
        }
    };

    // Mostrar loading sutil mientras se inicializa
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
        <div className="animate-fade-in"> {/* Animación suave de entrada */}
            <h1 className="text-4xl text-white font-bold">Crear Cuenta</h1>
            <form
                onSubmit={handleSubmit(handelRegister)}
                className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
                noValidate
            >
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="name" className="text-2xl text-slate-500">
                        Nombre
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Nombre"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("name", {
                            required: "El Nombre es obligatorio",
                        })}
                    />
                    {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                </div>

                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="lastname" className="text-2xl text-slate-500">
                        Apellido
                    </label>
                    <input
                        id="lastname"
                        type="text"
                        placeholder="Apellido"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("lastname", {
                            required: "El Apellido es obligatorio",
                        })}
                    />
                    {errors.lastname && (<ErrorMessage>{errors.lastname.message}</ErrorMessage>)}
                </div>

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
                            setValueAs: (value) => value?.toLowerCase()
                        })}
                    />
                    {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                </div>

                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="password" className="text-2xl text-slate-500">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña de Registro"
                            className="bg-slate-100 border-none p-3 pr-12 rounded-lg placeholder-slate-400 w-full"
                            {...register("password", {
                                required: "La Contraseña es obligatoria",
                                minLength: {
                                    value: 6,
                                    message: "La Contraseña debe tener al menos 6 caracteres",
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
                    {errors.password && (<ErrorMessage>{errors.password.message}</ErrorMessage>)}
                </div>

                <div className="grid grid-cols-1 space-y-3">
                    <label
                        htmlFor="password_confirmation"
                        className="text-2xl text-slate-500"
                    >
                        Repetir Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="password_confirmation"
                            type={showPasswordConfirmation ? "text" : "password"}
                            placeholder="Repetir Contraseña"
                            className="bg-slate-100 border-none p-3 pr-12 rounded-lg placeholder-slate-400 w-full"
                            {...register("password_confirmation", {
                                required: "La Contraseña es obligatoria",
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
                    className="bg-blue-600 p-3 text-lg w-full text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors"
                    value="Crear Cuenta"
                />
            </form>
        </div>
    );
};

export default RegisterView;