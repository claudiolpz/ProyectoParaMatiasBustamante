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
  const [auth, setAuth] = useState<boolean>(() => {
    const savedToken = localStorage.getItem("AUTH_TOKEN");
    return !!savedToken;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("AUTH_TOKEN");
  });

  const [user, setUser] = useState<UserTokenVerify | null>(null);
  const [initializing, setInitializing] = useState(() => {
    // Solo inicializar si hay token
    const savedToken = localStorage.getItem("AUTH_TOKEN");
    return !!savedToken;
  });

  const queryClient = useQueryClient();

  const { 
    data: serverUserData, 
    isLoading: queryLoading,
    isError,
    error,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled: auth && !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // Actualizar usuario cuando llegan datos del servidor
  useEffect(() => {
    if (serverUserData) {
      setUser(serverUserData);
      setInitializing(false);
    }
  }, [serverUserData]);

  // Si no hay token, no necesita inicializar
  useEffect(() => {
    if (!auth || !token) {
      setInitializing(false);
    }
  }, [auth, token]);

  // Manejar errores
  useEffect(() => {
    if (isError) {
      console.log('Error en verificación de usuario:', error);
      if (error?.response?.status === 401) {
        console.log('Token inválido, cerrando sesión');
      }
      clearAuth();
    }
  }, [isError, error]);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("AUTH_TOKEN");
    setAuth(false);
    setToken(null);
    setUser(null);
    setInitializing(false);
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.clear();
  }, [queryClient]);

  const handleIniciarSesion = useCallback(async (newToken: string) => {
    try {
      localStorage.setItem("AUTH_TOKEN", newToken);
      setToken(newToken);
      setAuth(true);
      setInitializing(true);
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [clearAuth]);

  const handleCerrarSesion = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const handleEstaLogeado = useCallback((): boolean => {
    return auth && !!token && !!user;
  }, [auth, token, user]);

  const refreshUser = useCallback(async () => {
    try {
      await refetchUser();
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
    }
  }, [refetchUser]);

  // Loading cuando está inicializando O cuando está haciendo query
  const loading = initializing || (queryLoading && auth);

  const contextValue: AuthContextType = useMemo(() => ({
    auth,
    user,
    token,
    loading,
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