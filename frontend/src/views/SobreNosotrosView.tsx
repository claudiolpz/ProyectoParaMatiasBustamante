import { NavLink } from "react-router";

const SobreNosotrosView = () => {
    return (
        <div>
            <h1>Sobre Nosotros</h1>
            <nav>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold underline" : "text-gray-600"
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/sobre-nosotros"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold underline" : "text-gray-600"
                    }
                >
                    SobreNosotros
                </NavLink>
            </nav>
        </div>
    );
};

export default SobreNosotrosView;
