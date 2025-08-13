import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth, useAuthRoles } from '../context/AuthProvider';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shouldShowAuth, setShouldShowAuth] = useState(false);
  const { user, handleCerrarSesion, handleEstaLogeado, loading } = useAuth();
  const { isAdmin } = useAuthRoles();

  useEffect(() => {
    if (!loading) {
      setShouldShowAuth(true);
    }
  }, [loading]);

  // Función para confirmar cierre de sesión
  const confirmarCerrarSesion = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar tu sesión actual?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red-600
      cancelButtonColor: '#6b7280', // gray-500
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#1f2937', // gray-800
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 rounded-md font-medium',
        cancelButton: 'px-4 py-2 rounded-md font-medium'
      },
      buttonsStyling: true
    });

    if (result.isConfirmed) {

      handleCerrarSesion();
      toast.success('¡Sesión cerrada exitosamente!')
    }
  };

  // Función para cerrar sesión en móvil (con cierre de menú)
  const confirmarCerrarSesionMobile = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres cerrar tu sesión actual?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton: 'px-4 py-2 rounded-md font-medium',
        cancelButton: 'px-4 py-2 rounded-md font-medium'
      },
      buttonsStyling: true
    });

    if (result.isConfirmed) {
      // Cerrar menú móvil primero
      setMobileMenuOpen(false);
      // Cerrar sesión
      handleCerrarSesion();
      toast.success('¡Sesión cerrada exitosamente')
    }
  };

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

    if (handleEstaLogeado()) {
      return (
        <div className="flex items-center gap-x-4 animate-fade-in">
          <span className="text-sm text-gray-600">
            Hola, {user?.name || 'Usuario'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {user?.role || 'user'}
          </span>
          <button
            onClick={confirmarCerrarSesion}
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-x-4 animate-fade-in">
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
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    if (handleEstaLogeado()) {
      return (
        <div className="space-y-2 animate-fade-in">
          <div className="px-3 py-2">
            <p className="text-sm text-gray-600">Hola, {user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
          </div>
          <button
            onClick={confirmarCerrarSesionMobile}
            className="block w-full text-left rounded-lg px-3 py-2 text-base font-semibold text-red-600 hover:bg-gray-50 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2 animate-fade-in">
        <Link
          to="/auth/login"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/auth/register"
          onClick={() => setMobileMenuOpen(false)}
          className="block rounded-lg px-3 py-2 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
        >
          Registrarse
        </Link>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo - Siempre visible */}
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

        {/* Desktop Navigation - Productos siempre visible */}
        <div className="hidden lg:flex lg:gap-x-12">
          {/* Productos - Siempre visible para todos los usuarios */}
          <Link to="/" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200">
            Productos
          </Link>
          
          {/* Enlaces solo para usuarios autenticados y admin */}
          {(!loading && handleEstaLogeado() && isAdmin()) && (
            <>
              <Link to="/products/create" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200">
                Crear Producto
              </Link>
              <Link to="/admin" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors duration-200">
                Admin
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
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm border-l animate-slide-in-right">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                <img alt="Logo" src="/mancuerna.svg" className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
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
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Inicio
                  </Link>
                  
                  {/* Productos - Siempre visible en mobile también */}
                  <Link
                    to="/list-products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Productos
                  </Link>
                  
                  {/* Mobile navigation - Solo mostrar enlaces admin si está autenticado y es admin */}
                  {(!loading && handleEstaLogeado() && isAdmin()) && (
                    <>
                      <Link
                        to="/products/create"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Crear Producto
                      </Link>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Admin
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