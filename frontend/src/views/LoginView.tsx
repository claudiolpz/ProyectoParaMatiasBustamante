import { Link } from "react-router";

const LoginView = () => {
    return (
        <>
            
            <nav>
                <Link to="/auth/Register">
                    Crear Cuenta
                </Link>
            </nav>
        </>
    );
};

export default LoginView;
