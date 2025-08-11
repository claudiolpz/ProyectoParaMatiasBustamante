import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '../context/AuthProvider';
import Header from './Header';

export default function FrontendLayout() {
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