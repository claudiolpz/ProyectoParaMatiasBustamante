import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthProvider';

interface AuthRedirectProps {
  children: ReactNode;
  redirectTo?: string;
  redirectWhen?: 'authenticated' | 'unauthenticated';
  showLoading?: boolean;
}

export const AuthRedirect = ({ 
  children, 
  redirectTo = '/',
  redirectWhen = 'authenticated',
  showLoading = true 
}: AuthRedirectProps) => {
  const { handleEstaLogeado, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const isAuthenticated = handleEstaLogeado();
      
      // Simplificar la lógica - solo una condición que determina si debe redirigir
      const shouldRedirect = 
        (redirectWhen === 'authenticated' && isAuthenticated) ||
        (redirectWhen === 'unauthenticated' && !isAuthenticated);
      
      if (shouldRedirect) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [loading, handleEstaLogeado, navigate, redirectTo, redirectWhen]);

  // Loading centralizado y consistente con el Header
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente específico para rutas de invitados (login/register)
export const GuestRoute = ({ children }: { children: ReactNode }) => (
  <AuthRedirect redirectWhen="authenticated" redirectTo="/">
    {children}
  </AuthRedirect>
);

// Componente específico para rutas protegidas
export const ProtectedRoute = ({ children }: { children: ReactNode }) => (
  <AuthRedirect redirectWhen="unauthenticated" redirectTo="/auth/login">
    {children}
  </AuthRedirect>
);