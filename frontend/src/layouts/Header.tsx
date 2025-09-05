import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuth, useAuthRoles } from '../context/AuthProvider';
import { useSwalAlerts } from '../utils/swalAlerts';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shouldShowAuth, setShouldShowAuth] = useState(false);
  const { user, handleCerrarSesion, handleEstaLogeado, loading } = useAuth();
  const { isAdmin } = useAuthRoles();
  const { confirmarCerrarSesion } = useSwalAlerts();

  // Variables para mejor legibilidad (NUEVAS)
  const isAuthenticated = handleEstaLogeado();
  const isUserAdmin = isAdmin();
  const showAdminLinks = !loading && isAuthenticated && isUserAdmin;

  const handleConfirmCerrarSesion = async (isMobile: boolean = false) => {
    const result = await confirmarCerrarSesion();

    if (result.isConfirmed) {
      if (isMobile) {
        setMobileMenuOpen(false);
      }
      handleCerrarSesion();
      toast.success('¡Sesión cerrada exitosamente!');
    }
  };

  // Función para cerrar menú móvil
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!loading) {
      setShouldShowAuth(true);
    }
  }, [loading]);

  // Extraer lógica del ternario anidado
  const renderAuthSection = () => {
    if (loading && !shouldShowAuth) {
      return (
        <div className="flex items-center gap-x-3 opacity-60">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-x-4 animate-fade-in">
          <span className="text-sm text-gray-600">
            Hola, {user?.name || 'Usuario'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {user?.role || 'user'}
          </span>
          <button
            onClick={() => handleConfirmCerrarSesion(false)}
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-x-4 animate-fade-in select-none">
        <Link
          to="/auth/login"
          className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/auth/register"
          className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Registrarse
        </Link>
      </div>
    );
  };

  // Extraer lógica del ternario anidado móvil
  const renderMobileAuthSection = () => {
    if (loading && !shouldShowAuth) {
      return (
        <div className="space-y-2 select-none">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="space-y-2 animate-fade-in select-none">
          <div className="px-3 py-2">
            <p className="text-sm text-gray-600">Hola, {user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
          </div>
          <button
            onClick={() => handleConfirmCerrarSesion(true)}
            className="block w-full text-left rounded-lg px-3 py-2 text-base font-semibold text-red-600 hover:bg-gray-50 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2 animate-fade-in select-none">
        <Link
          to="/auth/login"
          onClick={closeMobileMenu}
          className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/auth/register"
          onClick={closeMobileMenu}
          className="block rounded-lg px-3 py-2 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
        >
          Registrarse
        </Link>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm select-none">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <img alt="Logo" src="/mancuerna.svg" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="sr-only">Abrir menú</span>
            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link to="/" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200">
            Productos
          </Link>

          {/* Enlaces solo para usuarios autenticados y admin */}
          {showAdminLinks && (
            <>
              <Link to="/products/create" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200">
                Crear Producto
              </Link>
              <Link to="/sales" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200">
                Ventas
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          {renderAuthSection()}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black bg-opacity-25 animate-fade-in cursor-default"
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm border-l animate-slide-in-right">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5" onClick={closeMobileMenu}>
                <img alt="Logo" src="/mancuerna.svg" className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="sr-only">Cerrar menú</span>
                <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Productos
                  </Link>

                  {/* Mobile navigation - Solo mostrar enlaces admin si está autenticado y es admin */}
                  {showAdminLinks && (
                    <>
                      <Link
                        to="/products/create"
                        onClick={closeMobileMenu}
                        className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Crear Producto
                      </Link>
                      <Link
                        to="/sales"
                        onClick={closeMobileMenu}
                        className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Ventas
                      </Link>
                    </>
                  )}
                </div>

                <div className="py-6">
                  {renderMobileAuthSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}