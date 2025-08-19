import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { toast } from 'sonner';
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import type { RegisterForm } from "../types";
import ErrorMessage from "../components/ErrorMessage";
import api from "../config/axios";
import {passwordRegex, expresion_correo} from "../validators/accontValidator";

const RegisterView = () => {
    const { handleEstaLogeado, loading } = useAuth();
    const navigate = useNavigate();
    const [isInitializing, setIsInitializing] = useState(true);

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

    const handelRegister = async (formData: RegisterForm) => {
        try {
            const { data } = await api.post(`/auth/register`, formData);
            toast.success(data.message || "Cuenta creada exitosamente");
            reset();
            
            navigate('/auth/login', { 
                replace: true,
                state: { 
                    message: 'Cuenta creada. Revisa tu email para verificar tu cuenta antes de iniciar sesión.',
                    email: formData.email 
                }
            });
            
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                if (error.response.data.error) {
                    toast.error(error.response.data.error);
                } 
                if (error.response.data.errors) {
                    error.response.data.errors.forEach((err: any) => {
                        if (err.msg) {
                            toast.error(err.msg);
                        }
                    });
                }
            } else {
                toast.error("Error al crear la cuenta");
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
                {/* ... resto del formulario igual ... */}
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
                    <input
                        id="password"
                        type="password"
                        placeholder="Contraseña de Registro"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
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
                    {errors.password && (<ErrorMessage>{errors.password.message}</ErrorMessage>)}
                </div>

                <div className="grid grid-cols-1 space-y-3">
                    <label
                        htmlFor="password_confirmation"
                        className="text-2xl text-slate-500"
                    >
                        Repetir Contraseña
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        placeholder="Repetir Contraseña"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("password_confirmation", {
                            required: "La Contraseña es obligatoria",
                            validate: (value) => value === password || 'Las Contraseñas no son iguales'
                        })}
                    />

                    {errors.password_confirmation && (
                        <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
                    )}
                </div>

                <input
                    type="submit"
                    className="bg-blue-600 p-3 text-lg w-full uppercase text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700 transition-colors"
                    value="Crear Cuenta"
                />
            </form>
        </div>
    );
};

export default RegisterView;