import { Outlet } from 'react-router';

export default function InitialLayout() {
  
  return (
    <>
      <div className="bg-slate-800 min-h-screen">
        <div className={'max-w-lg mx-auto pt-10 px-5'}>      
          <div className={'py-4'}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}