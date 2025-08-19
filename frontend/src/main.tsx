import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";

import SobreNosotrosView from "./views/SobreNosotrosView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import CreateProduct from "./views/CreateProduct";
import TableProduct from "./views/TableProduct";
import EditProduct from "./views/EditProduct";
import FrontendLayout from "./layouts/FrontendLayout";
import { GuestRoute, ProtectedRoute } from "./components/AuthGuard";
import InitialLayout from "./layouts/InitalLayout";
import Error404 from "./views/Error404";
import SalesTable from "./views/SalesTable";
import VerifyEmailView from "./views/VerifyEmailView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FrontendLayout />,
    children: [
      {
        index: true,
        element: <TableProduct />,
      },
      {
        path: '/*',
        element: <Error404 />,
      },
      {
        path: "/sales",
        element: (
          <ProtectedRoute requiredRole="admin">
            <SalesTable />
          </ProtectedRoute>
        ),
      },
      {
        element: <InitialLayout />,
        children: [
          {
            path: "/auth/login",
            element: (
              <GuestRoute>
                <LoginView />
              </GuestRoute>
            ),
          },
          {
            path: "/auth/register",
            element: (
              <GuestRoute>
                <RegisterView />
              </GuestRoute>
            ),
          },
          {
            path: "/auth/verify-email",
            element: (
              <GuestRoute>
                <VerifyEmailView />
              </GuestRoute>
            ),
          },
          // Rutas protegidas - redirige si no está logueado
          {
            path: "/products/create",
            element: (
              <ProtectedRoute requiredRole="admin">
                <CreateProduct />
              </ProtectedRoute>
            ),
          },
          {
            path: "/products/edit/:id",
            element: (
              <ProtectedRoute requiredRole="admin">
                <EditProduct />
              </ProtectedRoute>
            ),
          },
        ]
      },

      {
        path: "/sobre-nosotros",
        element: <SobreNosotrosView />,
      },

    ]
  },

]);

// En tu main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutos - más tiempo
      gcTime: 20 * 60 * 1000, // 20 minutos en cache
      refetchOnWindowFocus: false, // No refrescar en focus
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: 200, // Más rápido
    },
  },
});


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>
);
