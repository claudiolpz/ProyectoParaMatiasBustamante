import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'

import HomeView from './views/HomeView'
import SobreNosotrosView from './views/SobreNosotrosView'


const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <HomeView />
      },
      {
        path: 'sobre-nosotros',
        element: <SobreNosotrosView />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

