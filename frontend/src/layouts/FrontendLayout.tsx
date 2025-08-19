import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '../context/AuthProvider';
import Header from './Header';
import { useEffect } from "react";

export default function FrontendLayout() {
     useEffect(() => {
    const handler = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", handler, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handler);
    };
  }, []);
  
    return (
        <AuthProvider>
            <main className="main-content">
                <Header />
                <Outlet />
            </main>
            <Toaster position='top-center' />
        </AuthProvider>
    );
}