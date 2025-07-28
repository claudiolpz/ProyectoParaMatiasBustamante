import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
export default function AuthLayout() {
  return (
    <>
    <div className="bg-slate-800 min-h-screen">
                <div className="max-w-lg mx-auto pt-10 px-5">
                    <img
                        src="/mancuerna.svg"
                        alt="mancuerna Icon"
                        className="w-16 h-16 mx-auto mb-4"
                    />
                    <div className="py-4">
                        <Outlet />
                    </div>
                </div>
            </div>
            <Toaster position='top-right'/>
    </>
  )
}
