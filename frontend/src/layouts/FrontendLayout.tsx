import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '../context/AuthProvider';
import Header from './Header';
import { useEffect } from "react";
import Footer from './Footer';

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
            <Footer />
            <Toaster position='top-center' className='select-none'/>
        </AuthProvider>
    );
}