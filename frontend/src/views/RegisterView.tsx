import { Link } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import type { RegisterForm } from "../types";
import ErrorMessage from "../components/ErrorMessage";

const RegisterView = () => {
    const initialValues: RegisterForm = {
        name: "",
        lastname: "",
        email: "",
        password: "",
        password_confirmation: "",
    };
    const {register,watch,handleSubmit,formState: { errors },} = useForm({ defaultValues: initialValues });
    const password = watch("password", "password_confirmation");

    const handelRegister = async (formData: RegisterForm) => {
        try{
            const response = await axios.post(`${import.meta.env.VITE_API_URL}register`, formData);
            console.log(response)
        }catch (error) {
            console.error(error);
        }
    };
    return (
        <>
            <h1 className="text-4xl text-white font-bold">Crear Cuenta</h1>
            <form
                onSubmit={handleSubmit(handelRegister)}
                className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
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
                    <label htmlFor="name" className="text-2xl text-slate-500">
                        Apellido
                    </label>
                    <input
                        id="lastname"
                        type="text"
                        placeholder="Apellido"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("name", {
                            required: "El Apellido es obligatorio",
                        })}
                    />
                    {errors.lastname && (
                        <ErrorMessage>{errors.lastname.message}</ErrorMessage>
                    )}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="email" className="text-2xl text-slate-500">
                        Email
                    </label>
                    <input
                        id="email"
                        type="text"
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
                            required: "La Constraseña es obligatoria",
                            minLength: {
                                value: 6,
                                message: "La Contraseña debe tener al menos 6 caracteres",
                            },
                        })}
                    />
                    {errors.password && (
                        <ErrorMessage>{errors.password.message}</ErrorMessage>
                    )}
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
                            required: "La Constraseña es obligatoria",
                            validate: (value) =>
                                value === password || "Las contraseñas no coinciden",
                        })}
                    />

                    {errors.password_confirmation && (
                        <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
                    )}
                </div>

                <input
                    type="submit"
                    className="bg-blue-600 p-3 text-lg w-full uppercase text-white rounded-lg font-bold cursor-pointer"
                    value="Crear Cuenta"
                />
            </form>

            <nav>
                <Link to="/auth/login">Iniciar Sesión</Link>
            </nav>
        </>
    );
};

export default RegisterView;
