import { Outlet } from 'react-router';
import { Toaster } from 'sonner';

export default function InitialLayout() {

    return (
        <>
            <main className="main-content ">
                <Outlet />
            </main>
            <Toaster position='top-right' />
        </>
    )
}