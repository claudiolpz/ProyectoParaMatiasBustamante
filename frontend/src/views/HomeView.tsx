import { NavLink } from "react-router"

const HomeView = () => {
  return (
    <div>
      <h1 className='text-red-950 text-2xl'>Home</h1>

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
                <NavLink
                    to="/auth/login"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold underline" : "text-gray-600"
                    }
                >
                    Login
                </NavLink>
                <NavLink
                    to="/auth/register"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold underline" : "text-gray-600"
                    }
                >
                    register
                </NavLink>
                <NavLink
                    to="/products/create"
                    className={({ isActive }) =>
                        isActive ? "text-blue-600 font-bold underline" : "text-gray-600"
                    }
                >
                    Crear Producto
                </NavLink>
            </nav>
    </div>
  )
}

export default HomeView
