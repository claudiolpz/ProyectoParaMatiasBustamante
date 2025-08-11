import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";

import HomeView from "./views/HomeView";
import SobreNosotrosView from "./views/SobreNosotrosView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import InitialLayout from "./layouts/InitalLayout";
import CreateProduct from "./views/CreateProduct";
import TableProduct from "./views/TableProduct";
import FrontendLayout from "./layouts/FrontendLayout";
import AppLayout from "./layouts/AppLayout";
import { GuestRoute, ProtectedRoute } from "./components/AuthGuard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FrontendLayout />,
    children: [
      {
        path: "/",
        element: <InitialLayout />,
        children: [
          {
            index: true,
            element: <HomeView />,
          },
          {
            path: "/sobre-nosotros",
            element: <SobreNosotrosView />,
          },
          // Rutas de invitados - redirige si ya está logueado
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
          // Rutas protegidas - redirige si no está logueado
          {
            path: "/products/create",
            element: (
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            ),
          }
        ]
      },
      // Otras rutas protegidas
      {
        path: "/list-products",
        element: (
            <TableProduct />
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <HomeView />,
          },
          {
            path: 'profile',
            element: <HomeView />,
          }
        ]
      },
    ],
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
