import { Outlet, useLocation } from 'react-router';
import { Toaster } from 'sonner';

export default function InitialLayout() {
  const location = useLocation();
  
  // Rutas que necesitan ancho completo
  const fullWidthRoutes = ['/list-products', '/products/create'];
  const isFullWidth = fullWidthRoutes.includes(location.pathname);

  return (
    <>
      <div className="bg-slate-800 min-h-screen">
        {/* 🔧 CORRECCIÓN: Ancho condicional según la ruta */}
        <div className={isFullWidth ? 'w-full' : 'max-w-lg mx-auto pt-10 px-5'}>
          {/* Logo solo para rutas no fullWidth */}
          {!isFullWidth && (
            <img
              src="/mancuerna.svg"
              alt="mancuerna Icon"
              className="w-16 h-16 mx-auto mb-4"
            />
          )}
          
          <div className={isFullWidth ? '' : 'py-4'}>
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster position='top-right'/>
    </>
  )
}