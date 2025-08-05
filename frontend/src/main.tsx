import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";

import HomeView from "./views/HomeView";
import SobreNosotrosView from "./views/SobreNosotrosView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import InitialLayout from "./layouts/InitalLayout";
import CreateProduct from "./views/CreateProduct";
import TableProduct from "./views/TableProduct";


const router = createBrowserRouter([
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
      {
        path: "/auth/login",
        element: <LoginView />,
      },
      {
        path: "/auth/register",
        element: <RegisterView />,
      },
      {
        path: "/auth/login",
        element: <LoginView />,
      },
      {
        path: "/products/create",
        element: <CreateProduct />,
      },
      {
        path: "/list-products",
        element: <TableProduct />,
      }
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
