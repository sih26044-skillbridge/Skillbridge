import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Landing page or pure public pages can omit sidebar if desired
  const isLandingPage = location.pathname === '/';
  const showSidebar = isAuthenticated && !isLandingPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      <div className="flex-1 flex">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${!showSidebar ? 'max-w-7xl mx-auto w-full' : 'overflow-x-hidden'}`}>
          <Outlet />
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        SkillBridge — SIH26044 Portal for Academia–Industry Collaboration. Built for Smart India Hackathon.
      </footer>
    </div>
  );
};
