import { Link } from "react-router";

const LoginView = () => {
    return (
        <>
            <h1 className="text-4xl text-white font-bold">Iniciar Sesión</h1>
            <form
                onSubmit={() => { }}
                className="bg-white px-5 py-8 rounded-lg space-y-8 mt-6"
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
                    />
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
                    />
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
