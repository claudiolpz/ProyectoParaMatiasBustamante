import { Navigate } from "react-router";
import { useAuth, useAuthRoles } from "../context/AuthProvider";
import type { AuthGuardProps } from "../types";

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredRoles = [],
  fallback 
}: AuthGuardProps) => {
  const { auth, user, loading } = useAuth();
  const { hasRole, hasAnyRole } = useAuthRoles();

  // Mostrar loading mientras verifica el token
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-slate-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-white">Verificando acceso...</p>
          </div>
        </div>
      )
    );
  }

  // Si no está autenticado después del loading
  if (!auth || !user) {
    console.log('Acceso denegado: Usuario no autenticado');
    return <Navigate to="/auth/login" replace />;
  }

  // Verificar rol específico requerido
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`Acceso denegado: Rol requerido '${requiredRole}', rol actual '${user.role}'`);
    return <Navigate to="/" replace />;
  }

  // Verificar si tiene alguno de los roles requeridos
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    console.log(`Acceso denegado: Roles requeridos [${requiredRoles.join(', ')}], rol actual '${user.role}'`);
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las verificaciones
  console.log(`Acceso permitido: Usuario '${user.name}' con rol '${user.role}'`);
  return <>{children}</>;
};

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { auth, user, loading } = useAuth();

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white">Verificando estado...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, redirigir al inicio
  if (auth && user) {
    console.log('Usuario ya autenticado, redirigiendo al inicio');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};