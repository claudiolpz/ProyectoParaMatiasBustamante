import { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser } from "../api/ProyectApi";
import type { UserTokenVerify, AuthContextType, AuthProviderProps } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Verificar si hay token en localStorage
  const hasToken = !!localStorage.getItem("AUTH_TOKEN");

  // React Query para obtener datos del usuario
  const { 
    data: user, 
    isLoading: loading,
    isError,
    error,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled: hasToken && !!token, // Solo ejecutar si hay token
    staleTime: 5 * 60 * 1000, // 5 minutos en cache
    retry: (failureCount, error: any) => {
      // No reintentar si es error 401 (no autorizado)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // Effect para manejar la autenticación inicial
  useEffect(() => {
    const savedToken = localStorage.getItem("AUTH_TOKEN");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Effect para manejar el estado de autenticación basado en los datos del usuario
  useEffect(() => {
    if (user && token && !isError) {
      setAuth(true);
    } else if (isError || !token) {
      setAuth(false);
      // Si hay error 401, limpiar token
      if ((error)?.response?.status === 401) {
        clearAuth();
      }
    }
  }, [user, token, isError, error]);

  // Envolver clearAuth en useCallback
  const clearAuth = useCallback(() => {
    localStorage.removeItem("AUTH_TOKEN");
    setAuth(false);
    setToken(null);
    // Limpiar cache de React Query
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.clear();
  }, [queryClient]);

  // Envolver handleIniciarSesion en useCallback
  const handleIniciarSesion = useCallback(async (newToken: string, userData?: UserTokenVerify) => {
    try {
      // Guardar token
      localStorage.setItem("AUTH_TOKEN", newToken);
      setToken(newToken);
      
      if (userData) {
        // Si tenemos datos del usuario, ponerlos en cache
        queryClient.setQueryData(['user'], userData);
        setAuth(true);
      } else {
        // Si no, React Query automáticamente hará la petición
        await refetchUser();
      }
      
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [queryClient, refetchUser, clearAuth]);

  // Envolver handleCerrarSesion en useCallback
  const handleCerrarSesion = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // Envolver handleEstaLogeado en useCallback
  const handleEstaLogeado = useCallback((): boolean => {
    return auth && user !== null && token !== null && !isError;
  }, [auth, user, token, isError]);

  // Función para refrescar datos del usuario manualmente
  const refreshUser = useCallback(async () => {
    try {
      await refetchUser();
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
    }
  }, [refetchUser]);

  // Envolver contextValue en useMemo
  const contextValue: AuthContextType = useMemo(() => ({
    auth,
    user: user || null,
    token,
    loading,
    handleIniciarSesion,
    handleCerrarSesion,
    handleEstaLogeado,
    refreshUser, // Agregado si lo necesitas en el contexto
  }), [
    auth,
    user,
    token,
    loading,
    handleIniciarSesion,
    handleCerrarSesion,
    handleEstaLogeado,
    refreshUser
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook adicional para roles (independiente de React Query)
export const useAuthRoles = () => {
  const { user } = useAuth();
  
  // También puedes envolver estas funciones en useCallback si se usan frecuentemente
  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user?.role]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user?.role]);

  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  return { hasRole, hasAnyRole, isAdmin };
};

export { AuthProvider };
export default AuthContext;