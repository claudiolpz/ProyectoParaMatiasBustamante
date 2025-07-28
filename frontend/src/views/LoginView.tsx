import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from 'sonner'
import { isAxiosError } from "axios";
import api from "../config/axios";
import ErrorMessage from "../components/ErrorMessage";
import type { LoginForm } from "../types";
 

const LoginView = () => {

    const initialValues: LoginForm = {
        email: "",
        password: ""
    };
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

    const handelLogin = async (formData: LoginForm) => {
        try {
            const { data } = await api.post(`/auth/login`, formData);
            toast.success(data.message);
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
            }
        }
    }
    return (
        <>
            <h1 className="text-4xl text-white font-bold">Iniciar Sesión</h1>
            <form
                onSubmit={handleSubmit(handelLogin)}
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
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("password", {
                            required: "La Contraseña es obligatoria",
                        })}
                    />
                    {errors.password && (
                        <ErrorMessage>{errors.password.message}</ErrorMessage>
                    )}
                </div>

                <input
                    type="submit"
                    className="bg-blue-600 p-3 text-lg w-full uppercase text-white rounded-lg font-bold cursor-pointer"
                    value="Iniciar Sesión"
                />
            </form>
            <nav>
                <Link to="/auth/Register">Crear Cuenta</Link>
            </nav>
        </>
    );
};

export default LoginView;
