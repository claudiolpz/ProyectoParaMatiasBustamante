import { Link } from "react-router";

const RegisterView = () => {
    return (
        <>
            
            <nav>
                <Link to="/auth/login">
                    Iniciar Sesión
                </Link>
            </nav>
        </>
    );
};

export default RegisterView;
