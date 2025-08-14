import { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser } from "../api/ProyectApi";
import type { UserTokenVerify, AuthContextType, AuthProviderProps } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  // 🚀 ESTADO INMEDIATO desde localStorage (evita parpadeo)
  const [auth, setAuth] = useState<boolean>(() => {
    const savedToken = localStorage.getItem("AUTH_TOKEN");
    return !!savedToken; // true/false inmediatamente
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("AUTH_TOKEN"); // Valor inmediato
  });

  // 🚀 DATOS DE USUARIO INMEDIATOS desde localStorage
  const [user, setUser] = useState<UserTokenVerify | null>(() => {
    const savedUserData = localStorage.getItem("USER_DATA");
    return savedUserData ? JSON.parse(savedUserData) : null;
  });

  const queryClient = useQueryClient();

  // 🔄 React Query para SINCRONIZACIÓN con servidor (no para estado inicial)
  const { 
    data: serverUserData, 
    isLoading: queryLoading,
    isError,
    error,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled: auth && !!token, // Solo ejecutar si ya tenemos auth local
    staleTime: 5 * 60 * 1000, // 5 minutos en cache
    refetchOnWindowFocus: false, // Evitar requests innecesarios
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // 🔄 SINCRONIZAR datos del servidor con estado local
  useEffect(() => {
    if (serverUserData) {
      setUser(serverUserData);
      localStorage.setItem("USER_DATA", JSON.stringify(serverUserData));
    }
  }, [serverUserData]);

  // 🛡️ MANEJAR ERRORES (token inválido)
  useEffect(() => {
    if (isError && error?.response?.status === 401) {
      console.log('Token inválido, cerrando sesión automáticamente');
      clearAuth();
    }
  }, [isError, error]);

  // Limpiar autenticación
  const clearAuth = useCallback(() => {
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("USER_DATA");
    setAuth(false);
    setToken(null);
    setUser(null);
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.clear();
  }, [queryClient]);

  // Iniciar sesión
  const handleIniciarSesion = useCallback(async (newToken: string, userData?: UserTokenVerify) => {
    try {
      // 🚀 ACTUALIZAR ESTADO INMEDIATO
      localStorage.setItem("AUTH_TOKEN", newToken);
      setToken(newToken);
      setAuth(true);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem("USER_DATA", JSON.stringify(userData));
        queryClient.setQueryData(['user'], userData);
      }
      // React Query se activará automáticamente para verificar/actualizar
      
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [queryClient, clearAuth]);

  // Cerrar sesión
  const handleCerrarSesion = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // Verificar si está logueado
  const handleEstaLogeado = useCallback((): boolean => {
    return auth && !!token && !!user;
  }, [auth, token, user]);

  // Refrescar usuario
  const refreshUser = useCallback(async () => {
    try {
      await refetchUser();
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
    }
  }, [refetchUser]);

  // 🎯 Loading solo para requests activos, NO para verificación inicial
  const loading = queryLoading && auth; // Solo loading si estamos haciendo sync

  const contextValue: AuthContextType = useMemo(() => ({
    auth,
    user,
    token,
    loading, // Solo para sync, no para verificación inicial
    handleIniciarSesion,
    handleCerrarSesion,
    handleEstaLogeado,
    refreshUser,
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

// Hook para roles (sin cambios)
export const useAuthRoles = () => {
  const { user } = useAuth();
  
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